import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.0.5723:2',
  releaseNotes: {
    en_US:
      'Refreshed the container image with updated curl libraries; Prowlarr remains at 2.7.0.5723. Requires StartOS 0.4.1 or later. [Image release notes](https://github.com/linuxserver/docker-prowlarr/releases/tag/2.7.0.5723-ls167).',
    es_ES:
      'Se actualizó la imagen del contenedor con bibliotecas curl renovadas; Prowlarr sigue en 2.7.0.5723. Requiere StartOS 0.4.1 o posterior. [Notas de la imagen](https://github.com/linuxserver/docker-prowlarr/releases/tag/2.7.0.5723-ls167).',
    de_DE:
      'Das Container-Image enthält aktualisierte curl-Bibliotheken; Prowlarr bleibt bei 2.7.0.5723. Erfordert StartOS 0.4.1 oder neuer. [Versionshinweise zum Image](https://github.com/linuxserver/docker-prowlarr/releases/tag/2.7.0.5723-ls167).',
    pl_PL:
      'Odświeżono obraz kontenera, aktualizując biblioteki curl; Prowlarr pozostaje w wersji 2.7.0.5723. Wymagany StartOS 0.4.1 lub nowszy. [Informacje o wydaniu obrazu](https://github.com/linuxserver/docker-prowlarr/releases/tag/2.7.0.5723-ls167).',
    fr_FR:
      'L’image du conteneur intègre des bibliothèques curl actualisées ; Prowlarr reste en version 2.7.0.5723. Nécessite StartOS 0.4.1 ou ultérieur. [Notes de version de l’image](https://github.com/linuxserver/docker-prowlarr/releases/tag/2.7.0.5723-ls167).',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
