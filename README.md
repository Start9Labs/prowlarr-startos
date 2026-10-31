<p align="center">
  <img src="icon.svg" alt="Prowlarr Logo" width="21%">
</p>

# Prowlarr on StartOS

> Everything not listed in this document should behave the same as upstream Prowlarr.
> If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation section of
> `instructions.md` for links.

[Prowlarr](https://github.com/Prowlarr/Prowlarr) is an indexer manager that syncs torrent trackers and Usenet indexers to Sonarr, Radarr and other media apps. This package owns Prowlarr's API key and admin login, and connects it to the Sonarr and Radarr packages on the same server, reading their API keys itself, and to the Byparr package as its FlareSolverr indexer proxy.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The package runs the unmodified linuxserver.io Prowlarr image with its own entrypoint and s6-overlay init as PID 1.

| Property      | Value                                         |
| ------------- | --------------------------------------------- |
| Image         | `lscr.io/linuxserver/prowlarr`, unmodified    |
| Architectures | x86_64, aarch64                               |
| Entrypoint    | the image's `/init` (s6-overlay), `runAsInit` |
| Environment   | `PUID=1000`, `PGID=1000`, `TZ=Etc/UTC`        |

Subcontainers:

- `prowlarr-sub` — the Prowlarr daemon (`primary`). It also carries the read-only Sonarr/Radarr share mounts (see [Dependencies](#dependencies)). Attach with `start-cli package attach prowlarr -n prowlarr-sub -- <cmd>`; `curl` is available inside.

After `primary` is ready, a `reconcile` oneshot runs in the package's JavaScript runtime (no subcontainer) and drives Prowlarr's API on `127.0.0.1:9696` — see [File Models](#file-models).

## Volume and Data Layout

Everything lives on one volume, `main`.

| Path on `main` | Mounted at  | Contents                                                                                                                           |
| -------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `config/`      | `/config`   | Prowlarr's app data: `config.xml`, `prowlarr.db` and `logs.db` (SQLite), `Definitions/`, `asp/` (cookie keys), `logs/`, `Backups/` |
| `store.json`   | not mounted | StartOS-side state (see below)                                                                                                     |

The image chowns `/config` to `PUID:PGID` on every start, so files written by the package as root are fixed up before Prowlarr runs.

## File Models

Two files: Prowlarr's own `config.xml`, and the package's `store.json`.

**`config/config.xml`** (XML, `FileHelper.xml`, unknown keys preserved):

- Seeded at install with `AnalyticsEnabled=False`; after that, analytics belongs to the user.
- Re-asserted on **every start**, before Prowlarr launches: `ApiKey` (from `store.json`), `AuthenticationMethod=Forms`, `AuthenticationRequired=Enabled`, `BindAddress=*`, `Port=9696`, `UrlBase` empty, and `TrustedNetworks` set to the StartOS bridge IP (`10.0.3.1`). A hand edit or UI change to any of these reverts on the next start. `TrustedNetworks` is what makes Prowlarr honor the `X-Forwarded-Proto: https` StartOS's proxy sends; without it, the login redirect points at `http://` on the HTTPS port. `AuthenticationRequired=Enabled` is forced because proxied requests arrive from a local address, so `DisabledForLocalAddresses` would turn authentication off for everyone.
- Every other key belongs to Prowlarr and the user.

**`store.json`** (JSON, at the volume root):

| Key                          | Written by                  | Meaning                                                        |
| ---------------------------- | --------------------------- | -------------------------------------------------------------- |
| `apiKey`                     | install init (32 hex chars) | Prowlarr's API key; re-asserted into `config.xml` on start     |
| `adminPassword`              | Set Admin Password          | password of the `admin` user, in plaintext                     |
| `connectedApps`              | Connect Apps                | the apps selected for connection: `sonarr`, `radarr`, `byparr` |
| `sonarrAppId`, `radarrAppId` | the `reconcile` oneshot     | id of the Prowlarr application record the package manages      |
| `byparrProxyId`              | the `reconcile` oneshot     | id of the Prowlarr indexer proxy the package manages           |

On every start, `reconcile`:

1. Tries `POST /login` as `admin` with `adminPassword`; if that fails, applies it through `PUT /api/v1/config/host`. A password changed in the UI is therefore reset to the stored one on the next start.
2. For each of Sonarr and Radarr: when it is selected and installed, reads its API key from the share mount and creates (if needed) and updates an application record named after the app, implementation Sonarr/Radarr, sync level **Full Sync**, with `baseUrl` and `prowlarrUrl` set to the two packages' bridge addresses (`http://10.0.3.1:<assigned port>`). Other fields (sync categories, tags) are left as the user set them. When the app is deselected, it deletes the record whose id it stored. A selected app that is not installed is left alone. A pre-existing record with the same name and implementation is adopted rather than duplicated. A record it did not create or adopt is never deleted.

The records are written with `forceSave=true` and created disabled first, because Prowlarr runs a connection test on creating an enabled application and rejects it when the app is stopped. A connection failure is therefore not an error for `reconcile`; it shows up in Prowlarr's own health page instead.

3. For Byparr: when it is selected and installed, ensures a tag labelled `byparr` exists and creates (if needed) and updates an indexer proxy named `Byparr`, implementation FlareSolverr, with `host` set to Byparr's bridge address (`http://10.0.3.1:<assigned port>/`) and the `byparr` tag added to its tags. Other fields (request timeout, extra tags) are left as the user set them. A pre-existing FlareSolverr proxy named `Byparr` is adopted. When Byparr is deselected, it deletes the proxy whose id it stored; the tag stays, and indexers keep it. Prowlarr uses a FlareSolverr proxy only for indexers sharing one of its tags, so an untagged indexer never reaches Byparr. Created without tags first, then updated with `forceSave=true`, so a stopped Byparr is not an error.

`adminPassword`, `apiKey`, `connectedApps` and the selected apps' bridge addresses are read reactively by `main`, so changing any of them restarts Prowlarr and re-runs `reconcile`. The API key file itself is not watched; the bridge address stands in for it. Uninstalling a selected app removes its address and reinstalling it brings one back, each restarting Prowlarr, so a reinstalled app's new key is picked up without a manual restart. A key Sonarr or Radarr changed in place (not by a reinstall) reaches Prowlarr on its next restart.

## Dependencies

Sonarr, Radarr and Byparr, all optional, each declared only while selected in **Connect Apps**.

| Dependency | Kind      | Health checks | Mount                                                      | Why                                                  |
| ---------- | --------- | ------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| `sonarr`   | `running` | `primary`     | its `startos` volume, `share/`, read-only at `/mnt/sonarr` | read its API key (`api-key`); Prowlarr calls its API |
| `radarr`   | `running` | `primary`     | its `startos` volume, `share/`, read-only at `/mnt/radarr` | read its API key (`api-key`); Prowlarr calls its API |
| `byparr`   | `running` | `primary`     | none                                                       | Prowlarr sends Cloudflare-challenged requests to it  |

The host id and internal port of Sonarr and Radarr are imported from those packages (`ui-multi`; 8989 and 7878); Byparr's (`api`, 8191) are constants in `startos/utils.ts`. Each address is the dependency's bridge address. The Sonarr and Radarr mounts are added only while that bridge address resolves, i.e. while the app is installed, so a selected app that is not installed never blocks Prowlarr from starting.

## Network Access and Interfaces

One HTTP interface on a single binding (host `ui-multi`, port 9696).

| Interface | Id   | Type | Port | Purpose                             |
| --------- | ---- | ---- | ---- | ----------------------------------- |
| Web UI    | `ui` | `ui` | 9696 | web interface and the `/api/v1` API |

Sonarr and Radarr reach Prowlarr on its bridge address, `http://10.0.3.1:9696` when the preferred port was free.

## Installation and First-Run Flow

Prowlarr's first-run "create credentials" modal is never shown: install generates the API key and pre-seeds `config.xml` with Forms authentication, so before a password is set `/` redirects to `/login` and no user exists to sign in as. A critical task holds the service until **Set Admin Password** has run. The first start applies that password.

## Actions

Two user-facing actions; both may run while Prowlarr is running or stopped.

- **Set Admin Password** (`set-admin-password`, shown as **Reset Admin Password** once set) — run on first install and whenever the user has lost the password. Generates a 32-character password, stores it, and returns `admin` plus the password, once. If Prowlarr is running it restarts (a few seconds) and the new password applies on start; if stopped, it applies on the next start. Every run invalidates the previous password.
- **Connect Apps** (`connect-apps`) — a multiselect of Sonarr, Radarr and Byparr, prefilled from `store.json`. Run it after installing either app, or to stop syncing to one. Selecting an app declares the dependency and creates its record on the next start; deselecting removes the dependency and deletes the record the package made. Deleting the record only stops the syncing: the indexers Prowlarr already synced into the app (named `<indexer> (Prowlarr)`) stay in its **Settings → Indexers** and keep searching through Prowlarr until removed there. Idempotent: resubmitting the same selection does not restart. A changed selection restarts Prowlarr if running.

## Tasks

One task.

- **Set Admin Password** — `critical`; raised while `store.json` has no `adminPassword` (every fresh install). Cleared by running the action; returns only on a reinstall. While it is active Prowlarr cannot be started.

## Health Checks

One check, `primary` ("Web Interface"), on the daemon's readiness.

- It requests `http://127.0.0.1:9696/ping`, which Prowlarr serves unauthenticated once its web host is up. Any HTTP response passes. The first start after install runs database migrations and takes several seconds longer. A check that stays red means Prowlarr is not serving — read the service log for a startup exception.

The `reconcile` oneshot is not a health check; if it fails (Prowlarr's API rejecting a request), the error is in the service log as a failed `reconcile`.

## Backups and Restore

The `main` volume is copied wholesale (`ofVolumes`), with Prowlarr stopped.

Excluded, because Prowlarr regenerates them on start: `config/logs/`, `config/logs.db*` (the log database), `config/Sentry/`. Everything else — `prowlarr.db`, `config.xml`, `Definitions/` (including any custom definitions), `asp/` cookie keys, Prowlarr's own `Backups/` and `store.json` — is included.

A restored instance needs nothing re-entered: the admin password, API key and app selection come back with `store.json`. On the first start `reconcile` rewrites the Sonarr/Radarr records with the keys and bridge addresses on the restored server.

## Limitations and Differences

1. Authentication method, port, bind address, URL base, trusted networks and the API key are owned by the package; changing them in **Settings → General** reverts on the next start.
2. The admin username is always `admin`, and a password changed in the Prowlarr UI is reset to the stored one on the next start.
3. The **Sonarr** and **Radarr** application records the package manages have their URLs, API key and sync level re-asserted on every start while selected; the **Byparr** indexer proxy has its host and `byparr` tag re-asserted the same way.
4. Built-in updates are disabled (`UpdateMechanism=Docker`); Prowlarr updates with the package.
5. Only Sonarr and Radarr on the same server are connected automatically. Other apps (Lidarr, Readarr, a Sonarr elsewhere) are added in Prowlarr's UI as upstream documents.

---

## Quick Reference for AI Consumers

```yaml
package_id: prowlarr
image: lscr.io/linuxserver/prowlarr
architectures: [x86_64, aarch64]
subcontainers: [prowlarr-sub]
volumes:
  main: /config (subpath config)
file_models:
  - main/config/config.xml
  - main/store.json
startos_managed_env_vars:
  - PUID
  - PGID
  - TZ
dependencies: [sonarr, radarr, byparr] # all optional, enabled by connect-apps
interfaces:
  ui: { type: ui, port: 9696 }
actions:
  - set-admin-password
  - connect-apps
tasks:
  - { action: set-admin-password, severity: critical }
health_checks:
  - primary
```
