# Updating the upstream version

Upstream is the linuxserver.io Prowlarr image, pinned by tag in `startos/manifest/index.ts` (`images.prowlarr.source.dockerTag`).

## Determining the upstream version

linuxserver tags are `<prowlarr version>-ls<build>`. The latest stable release:

```bash
gh release view -R linuxserver/docker-prowlarr --json tagName -q .tagName
```

Ignore `nightly-*` and `develop-*` tags — those track Prowlarr's unstable branches.

## Applying the bump

1. Set `dockerTag` to `lscr.io/linuxserver/prowlarr:<tag>`.
2. Set `version` in `startos/versions/current.ts` to `<prowlarr version>:0` (the tag without `-ls<build>`). A new `-ls` build of the same Prowlarr version bumps the downstream revision instead (`:1`, `:2`, …).
3. Confirm the release still serves `/api/v1/config/host`, `/api/v1/applications` and `/ping` with the shapes `startos/utils.ts` uses, and that `config.xml` still carries the keys `startos/main.ts` re-asserts.
