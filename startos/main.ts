import { readFile } from 'node:fs/promises'
import { manifest as radarrManifest } from 'radarr-startos/startos/manifest'
import { manifest as sonarrManifest } from 'sonarr-startos/startos/manifest'
import { configXml } from './fileModels/config.xml'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  arrApps,
  byparrHostId,
  byparrPort,
  reconcile,
  uiHostId,
  uiPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Prowlarr!'))

  const store = await storeJson
    .read((s) => ({
      apiKey: s.apiKey,
      adminPassword: s.adminPassword,
      connectedApps: s.connectedApps,
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

  const prowlarrAddress = await sdk.host
    .getBridgeAddress(effects, {
      hostId: uiHostId,
      internalPort: uiPort,
      ssl: false,
    })
    .const()

  const addresses = Object.fromEntries(
    await Promise.all(
      arrApps.map(async ({ id, hostId, port }) => [
        id,
        store.connectedApps.includes(id)
          ? await sdk.host
              .getBridgeAddress(effects, {
                packageId: id,
                hostId,
                internalPort: port,
                ssl: false,
              })
              .const()
          : null,
      ]),
    ),
  )

  const byparrSelected = store.connectedApps.includes('byparr')
  const byparrAddress = byparrSelected
    ? await sdk.host
        .getBridgeAddress(effects, {
          packageId: 'byparr',
          hostId: byparrHostId,
          internalPort: byparrPort,
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
  if (addresses.sonarr)
    mounts = mounts.mountDependency<typeof sonarrManifest>({
      dependencyId: 'sonarr',
      volumeId: 'startos',
      subpath: 'share',
      mountpoint: '/mnt/sonarr',
      readonly: true,
    })
  if (addresses.radarr)
    mounts = mounts.mountDependency<typeof radarrManifest>({
      dependencyId: 'radarr',
      volumeId: 'startos',
      subpath: 'share',
      mountpoint: '/mnt/radarr',
      readonly: true,
    })

  const sub = sdk.SubContainer.of(
    effects,
    { imageId: 'prowlarr' },
    mounts,
    'prowlarr-sub',
  )

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
          await reconcile(
            effects,
            store.apiKey,
            store.adminPassword,
            prowlarrAddress,
            await Promise.all(
              arrApps.map(async ({ id, name }) => ({
                id,
                name,
                selected: store.connectedApps.includes(id),
                address: addresses[id],
                apiKey: addresses[id]
                  ? (
                      await readFile(
                        await sub.subpath(`/mnt/${id}/api-key`),
                        'utf8',
                      )
                    ).trim()
                  : null,
              })),
            ),
            { selected: byparrSelected, address: byparrAddress },
          )
          return null
        },
      },
      requires: ['primary'],
    })
})
