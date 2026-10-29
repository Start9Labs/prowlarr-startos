import { T } from '@start9labs/start-sdk'
import { storeJson, StoreType } from './fileModels/store.json'
import { radarrDescription, sonarrDescription } from './manifest/i18n'
import { sdk } from './sdk'

type Enabled = (options: { effects: T.Effects }) => Promise<boolean>

const selected =
  (id: StoreType['connectedApps'][number]): Enabled =>
  async ({ effects }) =>
    (await storeJson.read((s) => s.connectedApps).const(effects))?.includes(
      id,
    ) ?? false

export const dependencies = sdk.Dependencies.of()
  .addDependency(
    sdk.Dependency.optional('sonarr', {
      description: sonarrDescription,
      metadata: {
        title: 'Sonarr',
        icon: 'https://raw.githubusercontent.com/Sonarr/Sonarr/58fe69664800283237cbca06ace87766dfc66615/Logo/Sonarr.svg',
      },
      versionRange: '>=4.0.20.3014:0',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: selected('sonarr'),
    }),
  )
  .addDependency(
    sdk.Dependency.optional('radarr', {
      description: radarrDescription,
      metadata: {
        title: 'Radarr',
        icon: 'https://raw.githubusercontent.com/Radarr/Radarr/c0a0be6dde11ec4c9576366a7623322ea2a08775/Logo/Radarr.svg',
      },
      versionRange: '>=6.4.4.10685:0',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: selected('radarr'),
    }),
  )
