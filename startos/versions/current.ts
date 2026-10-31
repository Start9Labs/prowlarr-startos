import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.0.5723:1',
  releaseNotes: {
    en_US:
      'Connect Apps can connect Byparr, which Prowlarr then uses to get past Cloudflare challenges on indexers tagged `byparr`.',
    es_ES:
      'Conectar aplicaciones puede conectar Byparr, que Prowlarr usa para superar los desafíos de Cloudflare en los indexadores con la etiqueta `byparr`.',
    de_DE:
      'Apps verbinden kann Byparr verbinden, über das Prowlarr Cloudflare-Prüfungen bei Indexern mit dem Tag `byparr` besteht.',
    pl_PL:
      'Połącz aplikacje może połączyć Byparr, przez który Prowlarr przechodzi wyzwania Cloudflare na indeksatorach z tagiem `byparr`.',
    fr_FR:
      'Connecter les applications peut connecter Byparr, que Prowlarr utilise pour franchir les défis Cloudflare des indexeurs portant le tag `byparr`.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
