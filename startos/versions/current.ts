import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.0.5723:6',
  releaseNotes: {
    en_US:
      'Added Connect NZBGet for manual Usenet downloads with automatic credentials and a separate category. Connected Sonarr, Radarr and Lidarr API-key changes now apply automatically without a manual restart.',
    es_ES:
      'Se añadió Conectar NZBGet para descargas manuales de Usenet con credenciales automáticas y una categoría independiente. Los cambios de claves API de Sonarr, Radarr y Lidarr conectados se aplican sin reiniciar manualmente.',
    de_DE:
      'NZBGet verbinden für manuelle Usenet-Downloads mit automatischen Zugangsdaten und eigener Kategorie hinzugefügt. API-Schlüsseländerungen verbundener Sonarr-, Radarr- und Lidarr-Dienste werden ohne manuellen Neustart übernommen.',
    pl_PL:
      'Dodano Połącz NZBGet do ręcznych pobrań z Usenetu z automatycznymi danymi logowania i osobną kategorią. Zmiany kluczy API połączonych Sonarr, Radarr i Lidarr są stosowane bez ręcznego restartu.',
    fr_FR:
      'Ajout de Connecter NZBGet pour les téléchargements Usenet manuels avec identifiants automatiques et catégorie distincte. Les modifications de clés API de Sonarr, Radarr et Lidarr connectés sont appliquées sans redémarrage manuel.',
  },
  migrations: { up: async () => {}, down: IMPOSSIBLE },
})
