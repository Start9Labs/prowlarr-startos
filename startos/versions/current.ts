import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.0.5723:4',
  releaseNotes: {
    en_US:
      'Shelfarr can search Prowlarr directly without copying API keys. Connect from Shelfarr’s Connect Prowlarr action, not Prowlarr’s Connect Apps; no app sync record is created. Connect Apps now requires Sonarr 4.0.20.3014:7, Radarr 6.4.4.10685:6 and Lidarr 3.1.6.5079:1 or later.',
    es_ES:
      'Shelfarr puede buscar directamente en Prowlarr sin copiar claves API. Conecta desde la acción Conectar Prowlarr de Shelfarr, no desde Conectar aplicaciones de Prowlarr; no se crea ningún registro de sincronización de aplicaciones. Conectar aplicaciones ahora requiere Sonarr 4.0.20.3014:7, Radarr 6.4.4.10685:6 y Lidarr 3.1.6.5079:1 o posteriores.',
    de_DE:
      'Shelfarr kann Prowlarr direkt durchsuchen, ohne API-Schlüssel zu kopieren. Die Verbindung erfolgt über Prowlarr verbinden in Shelfarr, nicht über Apps verbinden in Prowlarr; es wird kein App-Synchronisierungseintrag erstellt. Apps verbinden erfordert jetzt Sonarr 4.0.20.3014:7, Radarr 6.4.4.10685:6 und Lidarr 3.1.6.5079:1 oder neuer.',
    pl_PL:
      'Shelfarr może wyszukiwać bezpośrednio w Prowlarr bez kopiowania kluczy API. Połącz przez akcję Połącz Prowlarr w Shelfarr, a nie Połącz aplikacje w Prowlarr; nie powstaje wpis synchronizacji aplikacji. Połącz aplikacje wymaga teraz Sonarr 4.0.20.3014:7, Radarr 6.4.4.10685:6 i Lidarr 3.1.6.5079:1 lub nowszych.',
    fr_FR:
      'Shelfarr peut rechercher directement dans Prowlarr sans copier de clés API. Utilisez l’action Connecter Prowlarr de Shelfarr, et non Connecter les applications de Prowlarr ; aucune entrée de synchronisation d’application n’est créée. Connecter les applications nécessite désormais Sonarr 4.0.20.3014:7, Radarr 6.4.4.10685:6 et Lidarr 3.1.6.5079:1 ou ultérieurs.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
