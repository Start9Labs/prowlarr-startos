import { storeJson } from './fileModels/store.json'
import {
  byparrDescription,
  nzbgetDescription,
  qbittorrentDescription,
} from './manifest/i18n'
import { sdk } from './sdk'

export const dependencies = sdk.Dependencies.of()
  .addDependency(
    sdk.Dependency.optional('qbittorrent', {
      description: qbittorrentDescription,
      metadata: {
        title: 'qBittorrent',
        icon: 'https://raw.githubusercontent.com/Start9Labs/qbittorrent-startos/144467638ad057ca958661484b0e2f86f24e0ee3/icon.svg',
      },
      versionRange: '>=5.3.0:5',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: async ({ effects }) =>
        (await storeJson.read((s) => s.qbittorrentConnected).const(effects)) ??
        false,
    }),
  )
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
    sdk.Dependency.optional('byparr', {
      description: byparrDescription,
      metadata: {
        title: 'Byparr',
        icon: 'https://raw.githubusercontent.com/ThePhaseless/Byparr/3a45795db314b3fe573959791b2454ea4c1198f8/icon/logo-byparr.svg',
      },
      versionRange: '>=3.0.4:0',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: async ({ effects }) =>
        (await storeJson.read((s) => s.byparrConnected).const(effects)) ??
        false,
    }),
  )
