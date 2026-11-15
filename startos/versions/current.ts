import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.0.5723:7',
  releaseNotes: {
    en_US:
      'Added Connect qBittorrent, which sends torrents grabbed in Prowlarr’s search to qBittorrent on this server.',
    es_ES:
      'Se añadió Conectar qBittorrent, que envía los torrents obtenidos en la búsqueda de Prowlarr a qBittorrent en este servidor.',
    de_DE:
      'qBittorrent verbinden hinzugefügt: In der Prowlarr-Suche ausgewählte Torrents werden an qBittorrent auf diesem Server gesendet.',
    pl_PL:
      'Dodano Połącz qBittorrent, które wysyła torrenty pobrane z wyszukiwania Prowlarr do qBittorrent na tym serwerze.',
    fr_FR:
      'Ajout de Connecter qBittorrent, qui envoie les torrents récupérés depuis la recherche de Prowlarr vers qBittorrent sur ce serveur.',
  },
  migrations: { up: async () => {}, down: IMPOSSIBLE },
})
