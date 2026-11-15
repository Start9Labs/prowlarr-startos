import { T } from '@start9labs/start-sdk'
import { storeJson, StoreType } from './fileModels/store.json'
import {
  byparrDescription,
  lidarrDescription,
  radarrDescription,
  sonarrDescription,
  nzbgetDescription,
} from './manifest/i18n'
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
    sdk.Dependency.optional('nzbget', {
      description: nzbgetDescription,
      metadata: {
        title: 'NZBGet',
        icon: 'https://raw.githubusercontent.com/Start9Labs/nzbget-startos/3f124f736163d0fa2e4667d7ef31b37983abb2ca/icon.svg',
      },
      versionRange: '>=26.3:0',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: async ({ effects }) =>
        (await storeJson.read((s) => s.nzbgetConnected).const(effects)) ??
        false,
    }),
  )
  .addDependency(
    sdk.Dependency.optional('sonarr', {
      description: sonarrDescription,
      metadata: {
        title: 'Sonarr',
        icon: 'https://raw.githubusercontent.com/Sonarr/Sonarr/58fe69664800283237cbca06ace87766dfc66615/Logo/Sonarr.svg',
      },
      versionRange: '>=4.0.20.3014:7',
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
      versionRange: '>=6.4.4.10685:6',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: selected('radarr'),
    }),
  )
  .addDependency(
    sdk.Dependency.optional('lidarr', {
      description: lidarrDescription,
      metadata: {
        title: 'Lidarr',
        icon: 'https://raw.githubusercontent.com/Lidarr/Lidarr/da7b4dfb1a9e7e1d6625c2dbc3fff96971ab26bd/Logo/Lidarr.svg',
      },
      versionRange: '>=3.1.6.5079:1',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: selected('lidarr'),
    }),
  )
  .addDependency(
    sdk.Dependency.optional('byparr', {
      description: byparrDescription,
      metadata: {
        title: 'Byparr',
        icon: 'https://raw.githubusercontent.com/ThePhaseless/Byparr/3a45795db314b3fe573959791b2454ea4c1198f8/icon/logo-byparr.svg',
      },
      versionRange: '>=3.0.4:0',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: selected('byparr'),
    }),
  )
