import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.7.0.5723:5',
  releaseNotes: {
    en_US:
      'Updated the Prowlarr 2.7.0.5723 image to LinuxServer build ls168 with refreshed system dependencies. Requires StartOS 0.4.2 or later. Full image release notes: https://github.com/linuxserver/docker-prowlarr/releases/tag/2.7.0.5723-ls168',
    es_ES:
      'Actualizada la imagen de Prowlarr 2.7.0.5723 a la compilación ls168 de LinuxServer con dependencias del sistema actualizadas. Requiere StartOS 0.4.2 o posterior. Notas completas de la imagen: https://github.com/linuxserver/docker-prowlarr/releases/tag/2.7.0.5723-ls168',
    de_DE:
      'Das Image von Prowlarr 2.7.0.5723 wurde auf LinuxServer-Build ls168 mit aktualisierten Systemabhängigkeiten gebracht. Erfordert StartOS 0.4.2 oder neuer. Vollständige Image-Versionshinweise: https://github.com/linuxserver/docker-prowlarr/releases/tag/2.7.0.5723-ls168',
    pl_PL:
      'Zaktualizowano obraz Prowlarr 2.7.0.5723 do kompilacji ls168 LinuxServer z odświeżonymi zależnościami systemowymi. Wymaga StartOS 0.4.2 lub nowszego. Pełne informacje o wydaniu obrazu: https://github.com/linuxserver/docker-prowlarr/releases/tag/2.7.0.5723-ls168',
    fr_FR:
      'Image de Prowlarr 2.7.0.5723 mise à jour vers la compilation ls168 de LinuxServer avec des dépendances système actualisées. Nécessite StartOS 0.4.2 ou ultérieur. Notes complètes de l’image : https://github.com/linuxserver/docker-prowlarr/releases/tag/2.7.0.5723-ls168',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
