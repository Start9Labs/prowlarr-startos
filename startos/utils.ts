import { z } from '@start9labs/start-sdk'
import {
  ArrApi,
  downloadClientAddressFields,
  reconcileArrDownloadClient,
} from 'nzbget-startos/startos/utils'

export const uiPort = 9696
export const uiHostId = 'ui-multi'
export const adminUsername = 'admin'
export const byparrHostId = 'api'
export const byparrPort = 8191

/** Package ids of the apps that sync from Prowlarr, keyed to their Prowlarr application implementation. */
export const syncedApps = {
  sonarr: 'Sonarr',
  radarr: 'Radarr',
  lidarr: 'Lidarr',
} as const

export type SyncedAppId = keyof typeof syncedApps
export const syncedAppIds = Object.keys(syncedApps) as SyncedAppId[]

/** Persisted intent and ownership handed off to upgraded app packages. */
export const legacyApplicationsShape = z
  .partialRecord(
    z.enum(syncedAppIds),
    z.looseObject({ connected: z.boolean(), appId: z.number().nullable() }),
  )
  .catch({})

/** A Prowlarr bridge address and its API key. */
export type ProwlarrConnection = { address: string; apiKey: string }

type Application = {
  id: number
  name: string
  implementation: string
  syncLevel: string
  fields: { name: string; value?: unknown }[]
}

type IndexerProxy = {
  id: number
  name: string
  implementation: string
  tags: number[]
  fields: { name: string; value?: unknown }[]
}

/** Reserved name of the application record a synced app manages. */
export function managedApplicationName(id: SyncedAppId) {
  return `${syncedApps[id]} (StartOS)`
}

export function prowlarrApi({ address, apiKey }: ProwlarrConnection): ArrApi {
  return async <A>(path: string, method = 'GET', body?: unknown) => {
    const res = await fetch(`http://${address}/api/v1${path}`, {
      method,
      headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${text}`)
    return JSON.parse(text || 'null') as A
  }
}

function ownsApplication(
  id: SyncedAppId,
  record: Application,
  legacyId: number | null,
) {
  return (
    record.implementation === syncedApps[id] &&
    (record.name === managedApplicationName(id) || record.id === legacyId)
  )
}

/**
 * Reconciles the application record a synced app keeps in Prowlarr.
 * Matches the stored id, the migrated id, or the reserved name.
 * An undecided connection follows migrated intent, then the reserved record.
 * Callers must read legacy-applications.json before reconciling.
 * Legacy ownership survives explicit connection choices.
 * Plain implementation names do not establish StartOS ownership.
 * Missing values preserve the record; disconnection deletes it.
 * The caller persists the returned decision and id.
 */
export async function reconcileProwlarrApplication(
  prowlarr: ProwlarrConnection,
  app: {
    id: SyncedAppId
    storedId: number | null
    connected: boolean | null
    legacy: z.infer<typeof legacyApplicationsShape>[SyncedAppId] | null
    values: { baseUrl: string; apiKey: string } | null
  },
): Promise<{ connected: boolean; appId: number | null }> {
  const api = prowlarrApi(prowlarr)
  const implementation = syncedApps[app.id]
  const name = managedApplicationName(app.id)
  const applications = await api<Application[]>('/applications')
  const legacy = app.legacy
  const current =
    applications.find(
      (a) => a.id === app.storedId && a.implementation === implementation,
    ) ??
    applications.find(
      (a) => a.id === legacy?.appId && a.implementation === implementation,
    ) ??
    applications.find(
      (a) => a.name === name && a.implementation === implementation,
    )
  const connected = app.connected ?? legacy?.connected ?? current !== undefined

  if (!connected) {
    if (current) await api(`/applications/${current.id}`, 'DELETE')
    return { connected, appId: null }
  }
  if (!app.values) return { connected, appId: current?.id ?? null }

  // Creating an enabled application tests the connection even with forceSave; updating with forceSave does not.
  const record =
    current ??
    (await api<Application>('/applications?forceSave=true', 'POST', {
      ...(await api<Application[]>('/applications/schema')).find(
        (s) => s.implementation === implementation,
      ),
      name,
      syncLevel: 'disabled',
    }))
  const values: Record<string, string> = {
    prowlarrUrl: `http://${prowlarr.address}`,
    baseUrl: app.values.baseUrl,
    apiKey: app.values.apiKey,
  }
  await api(`/applications/${record.id}?forceSave=true`, 'PUT', {
    ...record,
    name,
    syncLevel: 'fullSync',
    fields: record.fields.map((f) =>
      f.name in values ? { ...f, value: values[f.name] } : f,
    ),
  })
  return { connected, appId: record.id }
}

async function canLogIn(password: string) {
  const res = await fetch(`http://127.0.0.1:${uiPort}/login`, {
    method: 'POST',
    body: new URLSearchParams({ username: adminUsername, password }),
    redirect: 'manual',
  })
  return (
    res.status === 302 && !res.headers.get('location')?.includes('loginFailed')
  )
}

type ManagedIds = {
  sonarrAppId: number | null
  radarrAppId: number | null
  lidarrAppId: number | null
  byparrProxyId: number | null
  nzbgetClientId: number | null
  qbittorrentClientId: number | null
}

/** Legacy application ids retained for adoption and uninstall cleanup. */
export function legacyApplicationIds(stored: ManagedIds) {
  return {
    sonarr: stored.sonarrAppId,
    radarr: stored.radarrAppId,
    lidarr: stored.lidarrAppId,
  }
}

/** Returns the managed record ids for the caller to persist. */
export async function reconcile(
  apiKey: string,
  adminPassword: string | null,
  stored: ManagedIds,
  installedApps: Record<SyncedAppId, boolean>,
  byparr: { connected: boolean; address: string | null },
  nzbget: {
    connected: boolean
    credentials: { username: string; password: string } | null
    address: string | null
  },
  qbittorrent: {
    connected: boolean
    apiKey: string | null
    address: string | null
  },
): Promise<ManagedIds> {
  const api = prowlarrApi({ address: `127.0.0.1:${uiPort}`, apiKey })

  if (adminPassword && !(await canLogIn(adminPassword))) {
    const host = await api<object>('/config/host')
    await api('/config/host', 'PUT', {
      ...host,
      authenticationMethod: 'forms',
      authenticationRequired: 'enabled',
      username: adminUsername,
      password: adminPassword,
      passwordConfirmation: adminPassword,
    })
  }

  const nzbgetClientId = await reconcileArrDownloadClient(api, {
    storedId: stored.nzbgetClientId,
    name: 'NZBGet (StartOS)',
    implementation: 'Nzbget',
    connected: nzbget.connected,
    values:
      nzbget.address && nzbget.credentials
        ? {
            ...downloadClientAddressFields(nzbget.address),
            username: nzbget.credentials.username,
            password: nzbget.credentials.password,
          }
        : null,
    // Must name a category seeded by NZBGet.
    defaults: { category: 'prowlarr' },
  })
  const qbittorrentClientId = await reconcileArrDownloadClient(api, {
    storedId: stored.qbittorrentClientId,
    name: 'qBittorrent (StartOS)',
    implementation: 'QBittorrent',
    connected: qbittorrent.connected,
    values:
      qbittorrent.address && qbittorrent.apiKey
        ? {
            ...downloadClientAddressFields(qbittorrent.address),
            apiKey: qbittorrent.apiKey,
            username: '',
            password: '',
          }
        : null,
  })

  const legacyIds = legacyApplicationIds(stored)
  const applications = await api<Application[]>('/applications')
  for (const id of syncedAppIds) {
    if (!applications.some((a) => a.id === legacyIds[id])) legacyIds[id] = null
    if (installedApps[id]) continue
    for (const record of applications)
      if (ownsApplication(id, record, legacyIds[id]))
        await api(`/applications/${record.id}`, 'DELETE')
    legacyIds[id] = null
  }

  let byparrProxyId = stored.byparrProxyId
  const proxies = await api<IndexerProxy[]>('/indexerproxy')
  const currentProxy =
    proxies.find((p) => p.id === byparrProxyId) ??
    proxies.find(
      (p) => p.implementation === 'FlareSolverr' && p.name === 'Byparr',
    )

  if (!byparr.connected) {
    if (currentProxy && currentProxy.id === byparrProxyId)
      await api(`/indexerproxy/${currentProxy.id}`, 'DELETE')
    byparrProxyId = null
  } else if (byparr.address) {
    const tags = await api<{ id: number; label: string }[]>('/tag')
    const tagId = (
      tags.find((t) => t.label === 'byparr') ??
      (await api<{ id: number }>('/tag', 'POST', { label: 'byparr' }))
    ).id
    const template =
      currentProxy ??
      (await api<IndexerProxy[]>('/indexerproxy/schema')).find(
        (s) => s.implementation === 'FlareSolverr',
      )
    if (!template) throw new Error('Prowlarr has no FlareSolverr proxy schema')
    const record =
      currentProxy ??
      (await api<IndexerProxy>('/indexerproxy?forceSave=true', 'POST', {
        ...template,
        name: 'Byparr',
        tags: [],
      }))
    byparrProxyId = (
      await api<IndexerProxy>(
        `/indexerproxy/${record.id}?forceSave=true`,
        'PUT',
        {
          ...record,
          name: 'Byparr',
          tags: record.tags.includes(tagId)
            ? record.tags
            : [...record.tags, tagId],
          fields: record.fields.map((f) =>
            f.name === 'host'
              ? { ...f, value: `http://${byparr.address}/` }
              : f,
          ),
        },
      )
    ).id
  }

  return {
    sonarrAppId: legacyIds.sonarr,
    radarrAppId: legacyIds.radarr,
    lidarrAppId: legacyIds.lidarr,
    byparrProxyId,
    nzbgetClientId,
    qbittorrentClientId,
  }
}
