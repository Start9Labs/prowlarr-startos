import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'

export const current = VersionInfo.of({
  version: '3.0.2.5780:1',
  releaseNotes: {
    en_US: `Sonarr, Radarr and Lidarr now connect to Prowlarr from their own **Connect Prowlarr** action, and depend on Prowlarr instead of the other way round. Apps you already connected keep syncing once they are updated. Prowlarr removes the application record of an app you uninstall.

**Connect Apps** is replaced by **Connect Byparr**; a selected Byparr stays connected.`,
    es_ES: `Sonarr, Radarr y Lidarr ahora se conectan a Prowlarr desde su propia acción **Conectar Prowlarr** y dependen de Prowlarr, en lugar de al revés. Las aplicaciones que ya habías conectado siguen sincronizándose una vez actualizadas. Prowlarr elimina el registro de aplicación de una aplicación que desinstales.

**Conectar aplicaciones** se sustituye por **Conectar Byparr**; un Byparr seleccionado sigue conectado.`,
    de_DE: `Sonarr, Radarr und Lidarr verbinden sich jetzt über ihre eigene Aktion **Prowlarr verbinden** mit Prowlarr und hängen von Prowlarr ab statt umgekehrt. Bereits verbundene Apps synchronisieren nach ihrem Update weiter. Prowlarr entfernt den Anwendungseintrag einer deinstallierten App.

**Apps verbinden** wird durch **Byparr verbinden** ersetzt; ein ausgewähltes Byparr bleibt verbunden.`,
    pl_PL: `Sonarr, Radarr i Lidarr łączą się teraz z Prowlarr własną akcją **Połącz Prowlarr** i to one zależą od Prowlarr, a nie odwrotnie. Już połączone aplikacje po aktualizacji nadal się synchronizują. Prowlarr usuwa wpis aplikacji, którą odinstalujesz.

**Połącz Byparr** zastępuje **Połącz aplikacje**; wybrany Byparr pozostaje połączony.`,
    fr_FR: `Sonarr, Radarr et Lidarr se connectent désormais à Prowlarr depuis leur propre action **Connecter Prowlarr**, et dépendent de Prowlarr plutôt que l’inverse. Les applications déjà connectées continuent de se synchroniser une fois mises à jour. Prowlarr supprime l’enregistrement d’une application que vous désinstallez.

**Connecter les applications** est remplacée par **Connecter Byparr** ; un Byparr sélectionné reste connecté.`,
  },
  migrations: {
    up: async ({ effects }) => {
      const store = await storeJson.read().once()
      if (!store) return
      const { connectedApps, ...rest } = store as typeof store & {
        connectedApps?: unknown
      }
      if (connectedApps === undefined) return
      await storeJson.write(effects, {
        ...rest,
        byparrConnected:
          Array.isArray(connectedApps) && connectedApps.includes('byparr'),
      })
    },
    down: IMPOSSIBLE,
  },
})
