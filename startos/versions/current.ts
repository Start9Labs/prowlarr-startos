import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.2.5780:0',
  releaseNotes: {
    en_US: `Updated Prowlarr to 3.0.2.5780.

- New: Anthelion added as a default Torznab preset
- Fix: grabbing a release qBittorrent already has now reports it as rejected instead of failing
- Fix: API keys are hidden from logged search URLs
- Improved parsing for several indexers, including MyAnonamouse, AvistaZ and FileList

[Full release notes](https://github.com/Prowlarr/Prowlarr/releases)`,
    es_ES: `Prowlarr actualizado a 3.0.2.5780.

- Nuevo: Anthelion añadido como preajuste Torznab predeterminado
- Corrección: obtener una versión que qBittorrent ya tiene ahora se informa como rechazada en lugar de fallar
- Corrección: las claves API se ocultan en las URL de búsqueda registradas
- Análisis mejorado para varios indexadores, entre ellos MyAnonamouse, AvistaZ y FileList

[Notas de la versión completas](https://github.com/Prowlarr/Prowlarr/releases)`,
    de_DE: `Prowlarr auf 3.0.2.5780 aktualisiert.

- Neu: Anthelion als Standard-Torznab-Vorlage hinzugefügt
- Behoben: Ein Release, das qBittorrent bereits hat, wird jetzt als abgelehnt gemeldet statt fehlzuschlagen
- Behoben: API-Schlüssel werden in protokollierten Such-URLs ausgeblendet
- Verbesserte Auswertung für mehrere Indexer, darunter MyAnonamouse, AvistaZ und FileList

[Vollständige Versionshinweise](https://github.com/Prowlarr/Prowlarr/releases)`,
    pl_PL: `Zaktualizowano Prowlarr do 3.0.2.5780.

- Nowość: Anthelion dodany jako domyślny preset Torznab
- Poprawka: pobranie wydania, które qBittorrent już ma, jest teraz zgłaszane jako odrzucone zamiast kończyć się błędem
- Poprawka: klucze API są ukrywane w zapisywanych w logach adresach wyszukiwania
- Ulepszone przetwarzanie wyników kilku indeksatorów, w tym MyAnonamouse, AvistaZ i FileList

[Pełne informacje o wydaniu](https://github.com/Prowlarr/Prowlarr/releases)`,
    fr_FR: `Prowlarr mis à jour vers 3.0.2.5780.

- Nouveau : Anthelion ajouté comme préréglage Torznab par défaut
- Correction : récupérer une version que qBittorrent possède déjà est désormais signalé comme rejeté au lieu d’échouer
- Correction : les clés API sont masquées dans les URL de recherche journalisées
- Analyse améliorée pour plusieurs indexeurs, dont MyAnonamouse, AvistaZ et FileList

[Notes de version complètes](https://github.com/Prowlarr/Prowlarr/releases)`,
  },
  migrations: { up: async () => {}, down: IMPOSSIBLE },
})
