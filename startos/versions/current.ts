import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.1.0.5799:0',
  releaseNotes: {
    en_US: `Updated Prowlarr to 3.1.0.5799.

- New: per-indexer query timeout setting
- Fix: Cardigann indexer definitions with multiple categories
- Fix: MyAnonamouse results with numeric titles

[Full release notes](https://github.com/Prowlarr/Prowlarr/releases/tag/v3.1.0.5799)`,
    es_ES: `Prowlarr actualizado a 3.1.0.5799.

- Nuevo: tiempo de espera de consulta configurable por indexador
- Corrección: definiciones de indexadores Cardigann con varias categorías
- Corrección: resultados de MyAnonamouse con títulos numéricos

[Notas completas de la versión](https://github.com/Prowlarr/Prowlarr/releases/tag/v3.1.0.5799)`,
    de_DE: `Prowlarr auf 3.1.0.5799 aktualisiert.

- Neu: Abfrage-Timeout pro Indexer einstellbar
- Behoben: Cardigann-Indexer-Definitionen mit mehreren Kategorien
- Behoben: MyAnonamouse-Ergebnisse mit numerischen Titeln

[Vollständige Versionshinweise](https://github.com/Prowlarr/Prowlarr/releases/tag/v3.1.0.5799)`,
    pl_PL: `Zaktualizowano Prowlarr do 3.1.0.5799.

- Nowość: limit czasu zapytania ustawiany dla każdego indeksatora
- Poprawka: definicje indeksatorów Cardigann z wieloma kategoriami
- Poprawka: wyniki MyAnonamouse z tytułami liczbowymi

[Pełne informacje o wydaniu](https://github.com/Prowlarr/Prowlarr/releases/tag/v3.1.0.5799)`,
    fr_FR: `Prowlarr mis à jour vers 3.1.0.5799.

- Nouveau : délai d’expiration des requêtes réglable par indexeur
- Correctif : définitions d’indexeurs Cardigann à plusieurs catégories
- Correctif : résultats MyAnonamouse aux titres numériques

[Notes de version complètes](https://github.com/Prowlarr/Prowlarr/releases/tag/v3.1.0.5799)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
