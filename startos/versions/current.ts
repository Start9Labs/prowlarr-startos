import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.0.5723:3',
  releaseNotes: {
    en_US:
      'Connect Apps can now sync Prowlarr indexers to Lidarr installed on this server, without copying API keys.',
    es_ES:
      'Conectar aplicaciones ahora permite sincronizar los indexadores de Prowlarr con Lidarr instalado en este servidor, sin copiar claves API.',
    de_DE:
      'Apps verbinden kann Prowlarr-Indexer jetzt mit Lidarr auf diesem Server synchronisieren, ohne API-Schlüssel zu kopieren.',
    pl_PL:
      'Połącz aplikacje pozwala teraz synchronizować indeksatory Prowlarr z Lidarr zainstalowanym na tym serwerze, bez kopiowania kluczy API.',
    fr_FR:
      'Connecter les applications permet désormais de synchroniser les indexeurs Prowlarr avec Lidarr installé sur ce serveur, sans copier de clés API.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
