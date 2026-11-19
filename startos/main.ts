import { FileHelper } from '@start9labs/start-sdk'
import { manifest as nzbgetManifest } from 'nzbget-startos/startos/manifest'
import { credentialsShape } from 'nzbget-startos/startos/fileModels/credentials'
import {
  uiHostId as nzbgetHostId,
  uiPort as nzbgetPort,
} from 'nzbget-startos/startos/utils'
import { manifest as qbittorrentManifest } from 'qbittorrent-startos/startos/manifest'
import {
  uiHostId as qbittorrentHostId,
  uiPort as qbittorrentPort,
} from 'qbittorrent-startos/startos/utils'
import { configXml } from './fileModels/config.xml'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  byparrHostId,
  byparrPort,
  reconcile,
  SyncedAppId,
  syncedAppIds,
  uiPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Prowlarr!'))

  const store = await storeJson
    .read((s) => ({
      apiKey: s.apiKey,
      adminPassword: s.adminPassword,
      byparrConnected: s.byparrConnected,
      nzbgetConnected: s.nzbgetConnected,
      qbittorrentConnected: s.qbittorrentConnected,
    }))
    .const(effects)
  if (!store?.apiKey) throw new Error('store.json has no API key')

  await configXml.merge(effects, {
    Config: {
      ApiKey: store.apiKey,
      AuthenticationMethod: 'Forms',
      AuthenticationRequired: 'Enabled',
      BindAddress: '*',
      Port: String(uiPort),
      UrlBase: '',
      TrustedNetworks: await sdk.getOsIp(effects),
    },
  })

  const installedApps = Object.fromEntries(
    await Promise.all(
      syncedAppIds.map(async (id) => [
        id,
        await sdk.getServiceManifest(effects, id, (m) => m !== null).const(),
      ]),
    ),
  ) as Record<SyncedAppId, boolean>

  const byparrAddress = store.byparrConnected
    ? await sdk.host
        .getBridgeAddress(effects, {
          packageId: 'byparr',
          hostId: byparrHostId,
          internalPort: byparrPort,
          ssl: false,
        })
        .const()
    : null

  const nzbgetAddress = store.nzbgetConnected
    ? await sdk.host
        .getBridgeAddress(effects, {
          packageId: 'nzbget',
          hostId: nzbgetHostId,
          internalPort: nzbgetPort,
          ssl: false,
        })
        .const()
    : null

  const qbittorrentAddress = store.qbittorrentConnected
    ? await sdk.host
        .getBridgeAddress(effects, {
          packageId: 'qbittorrent',
          hostId: qbittorrentHostId,
          internalPort: qbittorrentPort,
          ssl: false,
        })
        .const()
    : null

  let mounts = sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: 'config',
    mountpoint: '/config',
    readonly: false,
  })
  if (nzbgetAddress)
    mounts = mounts.mountDependency<typeof nzbgetManifest>({
      dependencyId: 'nzbget',
      volumeId: 'public',
      subpath: null,
      mountpoint: '/mnt/nzbget',
      readonly: true,
    })

  if (qbittorrentAddress)
    mounts = mounts.mountDependency<typeof qbittorrentManifest>({
      dependencyId: 'qbittorrent',
      volumeId: 'public',
      subpath: null,
      mountpoint: '/mnt/qbittorrent',
      readonly: true,
    })

  const sub = sdk.SubContainer.of(
    effects,
    { imageId: 'prowlarr' },
    mounts,
    'prowlarr-sub',
  )

  const nzbgetCredentials = nzbgetAddress
    ? await FileHelper.json(
        await sub.subpath('/mnt/nzbget/credentials.json'),
        credentialsShape,
      )
        .read(({ username, password }) => ({ username, password }))
        .const(effects)
    : null
  const qbittorrentApiKey = qbittorrentAddress
    ? (
        await FileHelper.string(await sub.subpath('/mnt/qbittorrent/api-key'))
          .read()
          .const(effects)
      )?.trim() || null
    : null
  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
      subcontainer: sub,
      exec: {
        command: sdk.useEntrypoint(),
        runAsInit: true,
        env: { PUID: '1000', PGID: '1000', TZ: 'Etc/UTC' },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkWebUrl(
            effects,
            `http://127.0.0.1:${uiPort}/ping`,
            {
              successMessage: i18n('The web interface is ready'),
              errorMessage: i18n('The web interface is not ready'),
            },
          ),
      },
      requires: [],
    })
    .addOneshot('reconcile', {
      subcontainer: null,
      exec: {
        fn: async () => {
          const stored = await storeJson.read().once()
          if (!stored) throw new Error('store.json is missing')
          const ids = await reconcile(
            store.apiKey,
            store.adminPassword,
            stored,
            installedApps,
            { connected: store.byparrConnected, address: byparrAddress },
            {
              connected: store.nzbgetConnected,
              address: nzbgetAddress,
              credentials: nzbgetCredentials,
            },
            {
              connected: store.qbittorrentConnected,
              address: qbittorrentAddress,
              apiKey: qbittorrentApiKey,
            },
          )
          if (
            Object.entries(ids).some(
              ([k, v]) => stored[k as keyof typeof ids] !== v,
            )
          )
            await storeJson.merge(effects, ids)
          return null
        },
      },
      requires: ['primary'],
    })
})
