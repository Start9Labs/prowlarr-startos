import { T } from '@start9labs/start-sdk'
import {
  uiHostId as radarrHostId,
  uiPort as radarrPort,
} from 'radarr-startos/startos/utils'
import {
  uiHostId as sonarrHostId,
  uiPort as sonarrPort,
} from 'sonarr-startos/startos/utils'
import { storeJson } from './fileModels/store.json'

export const uiPort = 9696
export const uiHostId = 'ui-multi'
export const adminUsername = 'admin'

export const arrApps = [
  { id: 'sonarr', name: 'Sonarr', hostId: sonarrHostId, port: sonarrPort },
  { id: 'radarr', name: 'Radarr', hostId: radarrHostId, port: radarrPort },
] as const

export type ArrId = (typeof arrApps)[number]['id']

export type ArrConnection = {
  id: ArrId
  name: string
  selected: boolean
  apiKey: string | null
  address: string | null
}

type Application = {
  id: number
  name: string
  implementation: string
  syncLevel: string
  fields: { name: string; value?: unknown }[]
}

const local = `http://127.0.0.1:${uiPort}`

async function api<A>(
  apiKey: string,
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<A> {
  const res = await fetch(`${local}/api/v1${path}`, {
    method,
    headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${text}`)
  return JSON.parse(text || 'null')
}

async function canLogIn(password: string) {
  const res = await fetch(`${local}/login`, {
    method: 'POST',
    body: new URLSearchParams({ username: adminUsername, password }),
    redirect: 'manual',
  })
  return (
    res.status === 302 && !res.headers.get('location')?.includes('loginFailed')
  )
}

export async function reconcile(
  effects: T.Effects,
  apiKey: string,
  adminPassword: string | null,
  prowlarrAddress: string | null,
  connections: ArrConnection[],
) {
  if (adminPassword && !(await canLogIn(adminPassword))) {
    const host = await api<object>(apiKey, '/config/host')
    await api(apiKey, '/config/host', 'PUT', {
      ...host,
      authenticationMethod: 'forms',
      authenticationRequired: 'enabled',
      username: adminUsername,
      password: adminPassword,
      passwordConfirmation: adminPassword,
    })
  }

  const store = await storeJson.read().once()
  const appIds: Record<ArrId, number | null> = {
    sonarr: store?.sonarrAppId ?? null,
    radarr: store?.radarrAppId ?? null,
  }
  const existing = await api<Application[]>(apiKey, '/applications')

  for (const { id, name, selected, apiKey: arrKey, address } of connections) {
    const current =
      existing.find((a) => a.id === appIds[id]) ??
      existing.find((a) => a.implementation === name && a.name === name)

    if (!selected) {
      if (current && current.id === appIds[id])
        await api(apiKey, `/applications/${current.id}`, 'DELETE')
      appIds[id] = null
      continue
    }
    if (!arrKey || !address || !prowlarrAddress) continue

    // Creating an enabled application tests the connection even with forceSave; updating with forceSave does not.
    const record =
      current ??
      (await api<Application>(apiKey, '/applications?forceSave=true', 'POST', {
        ...(await api<Application[]>(apiKey, '/applications/schema')).find(
          (s) => s.implementation === name,
        ),
        name,
        syncLevel: 'disabled',
      }))
    const values: Record<string, string> = {
      prowlarrUrl: `http://${prowlarrAddress}`,
      baseUrl: `http://${address}`,
      apiKey: arrKey,
    }
    await api(apiKey, `/applications/${record.id}?forceSave=true`, 'PUT', {
      ...record,
      syncLevel: 'fullSync',
      fields: record.fields.map((f) =>
        f.name in values ? { ...f, value: values[f.name] } : f,
      ),
    })
    appIds[id] = record.id
  }

  if (
    appIds.sonarr !== (store?.sonarrAppId ?? null) ||
    appIds.radarr !== (store?.radarrAppId ?? null)
  )
    await storeJson.merge(effects, {
      sonarrAppId: appIds.sonarr,
      radarrAppId: appIds.radarr,
    })
}
