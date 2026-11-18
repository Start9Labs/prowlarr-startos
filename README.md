<p align="center">
  <img src="icon.svg" alt="Prowlarr Logo" width="21%">
</p>

# Prowlarr on StartOS

> Everything not listed in this document should behave the same as upstream Prowlarr.
> If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation section of
> `instructions.md` for links.

[Prowlarr](https://github.com/Prowlarr/Prowlarr) is an indexer manager that syncs torrent trackers and Usenet indexers to Sonarr, Radarr and other media apps. This package owns Prowlarr's API key and admin login and exports it to the Sonarr, Radarr and Lidarr packages on the same server, which register themselves as Prowlarr applications. It connects Prowlarr to the Byparr package as its FlareSolverr indexer proxy, and to the NZBGet and qBittorrent packages as the download clients for releases grabbed in Prowlarr.

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

- `prowlarr-sub` — the Prowlarr daemon (`primary`). It also carries the read-only NZBGet/qBittorrent `public` volume mounts (see [Dependencies](#dependencies)). Attach with `start-cli package attach prowlarr -n prowlarr-sub -- <cmd>`; `curl` is available inside.

After `primary` is ready, a `reconcile` oneshot runs in the package's JavaScript runtime (no subcontainer) and drives Prowlarr's API on `127.0.0.1:9696` — see [File Models](#file-models).

## Volume and Data Layout

Prowlarr's data and private package state live on `main`. A separate `public` volume carries only the API key export for dependents; Prowlarr's subcontainer does not mount it.

| Path on `main` | Mounted at  | Contents                                                                                                                           |
| -------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `config/`      | `/config`   | Prowlarr's app data: `config.xml`, `prowlarr.db` and `logs.db` (SQLite), `Definitions/`, `asp/` (cookie keys), `logs/`, `Backups/` |
| `store.json`   | not mounted | StartOS-side state (see below)                                                                                                     |

On `public`, `api-key` contains the stored Prowlarr API key as plain text. Dependents mount `public` read-only, never `main`. This exposes neither `store.json` nor the admin password.

Prowlarr mounts no download or library storage, even with NZBGet or qBittorrent connected: it hands the downloader the release and never imports the finished files.

The image chowns `/config` to `PUID:PGID` on every start, so files written by the package as root are fixed up before Prowlarr runs.

## File Models

Three files: Prowlarr's own `config.xml`, the package's private `store.json`, and the derived API key export.

**`config/config.xml`** (XML, `FileHelper.xml`, unknown keys preserved):

- Seeded at install with `AnalyticsEnabled=False`; after that, analytics belongs to the user.
- Re-asserted on **every start**, before Prowlarr launches: `ApiKey` (from `store.json`), `AuthenticationMethod=Forms`, `AuthenticationRequired=Enabled`, `BindAddress=*`, `Port=9696`, `UrlBase` empty, and `TrustedNetworks` set to the StartOS bridge IP (`10.0.3.1`). A hand edit or UI change to any of these reverts on the next start. `TrustedNetworks` is what makes Prowlarr honor the `X-Forwarded-Proto: https` StartOS's proxy sends; without it, the login redirect points at `http://` on the HTTPS port. `AuthenticationRequired=Enabled` is forced because proxied requests arrive from a local address, so `DisabledForLocalAddresses` would turn authentication off for everyone.
- Every other key belongs to Prowlarr and the user.

**`store.json`** (JSON, at the volume root):

| Key                                         | Written by                                           | Meaning                                                                                |
| ------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `apiKey`                                    | install init (32 hex chars)                          | Prowlarr's API key; re-asserted into `config.xml` on start                             |
| `adminPassword`                             | Set Admin Password                                   | password of the `admin` user, in plaintext                                             |
| `byparrConnected`                           | Connect Byparr                                       | whether Byparr is connected                                                            |
| `sonarrAppId`, `radarrAppId`, `lidarrAppId` | releases before 3.0.2.5780:1; cleared by `reconcile` | id of the application record an earlier release created, kept until the record is gone |
| `byparrProxyId`                             | the `reconcile` oneshot                              | id of the Prowlarr indexer proxy the package manages                                   |
| `nzbgetConnected`                           | Connect NZBGet                                       | whether NZBGet is connected                                                            |
| `nzbgetClientId`                            | the `reconcile` oneshot                              | id of the `NZBGet (StartOS)` download client the package manages                       |
| `qbittorrentConnected`                      | Connect qBittorrent                                  | whether qBittorrent is connected                                                       |
| `qbittorrentClientId`                       | the `reconcile` oneshot                              | id of the `qBittorrent (StartOS)` download client the package manages                  |

The 3.0.2.5780:1 migration turns the retired `connectedApps` selection into `byparrConnected`.

On every start, `reconcile`:

1. Tries `POST /login` as `admin` with `adminPassword`; if that fails, applies it through `PUT /api/v1/config/host`. A password changed in the UI is therefore reset to the stored one on the next start.
2. For NZBGet, through `reconcileArrDownloadClient` (imported from `nzbget-startos`): when connected with an available address and credentials, creates (if needed) and updates a download client named `NZBGet (StartOS)`, implementation Nzbget, enabled, with `host` and `port` set to NZBGet's bridge address, SSL off, and the restricted `username` and `password` NZBGet publishes in `credentials.json`, never its admin password. A new client gets category `prowlarr`, which NZBGet defines out of the box; after that the category and every other setting outside the connection are left as the user set them. It finds the client by the id it stored, or by its name in any letter case, so a start interrupted after the create never leaves a second client behind, and a client the user named `NZBGet (StartOS)` is adopted. When NZBGet is disconnected, it deletes that one client; other download clients are never touched. While NZBGet is connected but its address or credentials are unavailable, the client is left as it is. Created disabled, then enabled with `forceSave=true`, so a stopped NZBGet is not an error.
3. For qBittorrent, through the same `reconcileArrDownloadClient`: when connected with an available address and API key, creates (if needed) and updates a download client named `qBittorrent (StartOS)`, implementation QBittorrent, enabled, with `host` and `port` set to qBittorrent's bridge address, SSL off, and the Web API key qBittorrent publishes in `api-key`, with no username or password. A new client gets Prowlarr's default category, `prowlarr`; after that the category and every other setting outside the connection are left as the user set them. It is found, adopted, deleted and left alone exactly as the NZBGet client is, independently of it.
4. For each of Sonarr, Radarr and Lidarr that is not installed: deletes the application records that app manages (see [Synced apps](#synced-apps)), and the record an earlier release created for it, so an uninstalled app leaves nothing behind. A stored legacy id whose record no longer exists is cleared. Records of installed apps, and records with any other name, are never touched.

5. For Byparr: when it is connected and installed, ensures a tag labelled `byparr` exists and creates (if needed) and updates an indexer proxy named `Byparr`, implementation FlareSolverr, with `host` set to Byparr's bridge address (`http://10.0.3.1:<assigned port>/`) and the `byparr` tag added to its tags. Other fields (request timeout, extra tags) are left as the user set them. A pre-existing FlareSolverr proxy named `Byparr` is adopted. When Byparr is disconnected, it deletes the proxy whose id it stored; the tag stays, and indexers keep it. Prowlarr uses a FlareSolverr proxy only for indexers sharing one of its tags, so an untagged indexer never reaches Byparr. Created without tags first, then updated with `forceSave=true`, so a stopped Byparr is not an error.

`adminPassword`, `apiKey`, `byparrConnected`, `nzbgetConnected`, `qbittorrentConnected`, the connected dependencies' bridge addresses and their exported credentials, and whether each of Sonarr, Radarr and Lidarr is installed are watched reactively by `main`. For NZBGet, only username and password are watched; changing its published download path does not restart Prowlarr. Changes restart Prowlarr and rerun `reconcile`, so uninstalling a synced app removes its record right away. Uninstalling a dependency removes its address, and reinstalling it triggers reconciliation with its new address and key.

**`public/api-key`** (`FileHelper.string`): reactive init copies `main/store.json`'s nonempty `apiKey` on install, update, restore and container rebuild, and republishes it whenever that stored key changes. It does not generate a second key. A manual edit is overwritten on the next init or stored-key change.

## Dependencies

Byparr, NZBGet and qBittorrent, all optional, each declared only while connected with **Connect Byparr**, **Connect NZBGet** and **Connect qBittorrent**. Prowlarr does not depend on Sonarr, Radarr or Lidarr: they depend on Prowlarr (see [Synced apps](#synced-apps)).

| Dependency    | Kind      | Health checks | Mount                                                | Why                                                                   |
| ------------- | --------- | ------------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| `byparr`      | `running` | `primary`     | none                                                 | Prowlarr sends Cloudflare-challenged requests to it                   |
| `nzbget`      | `running` | `primary`     | its `public` volume, read-only at `/mnt/nzbget`      | read its credentials (`credentials.json`); Prowlarr sends grabs to it |
| `qbittorrent` | `running` | `primary`     | its `public` volume, read-only at `/mnt/qbittorrent` | read its Web API key (`api-key`); Prowlarr sends grabs to it          |

The host id and internal port of NZBGet and qBittorrent are imported from those packages (`ui-multi`; 6789 and 8080); Byparr's (`api`, 8191) are constants in `startos/utils.ts`. Each address is the dependency's bridge address. The NZBGet and qBittorrent mounts are added only while that bridge address resolves, i.e. while the service is installed, so a connected downloader that is not installed never blocks Prowlarr from starting. NZBGet's credentials and qBittorrent's API key are never copied into `store.json`; Prowlarr keeps them in the download client's settings.

## Network Access and Interfaces

One HTTP interface on a single binding (host `ui-multi`, port 9696).

| Interface | Id   | Type | Port | Purpose                             |
| --------- | ---- | ---- | ---- | ----------------------------------- |
| Web UI    | `ui` | `ui` | 9696 | web interface and the `/api/v1` API |

Sonarr, Radarr and Lidarr reach Prowlarr on its bridge address, `http://10.0.3.1:9696` when the preferred port was free. Dependents import the exported `uiHostId` and `uiPort` from `startos/utils.ts` to resolve the assigned bridge address.

Shelfarr queries Prowlarr directly through this API. Its **Connect Prowlarr** action consumes the API key export and resolves this binding. Shelfarr is not an arr sync app and has no Prowlarr sync provider, so no **Settings → Apps** record is created for it.

### Synced apps

Sonarr, Radarr and Lidarr each declare an optional `running` dependency on Prowlarr, enabled from their own **Connect Prowlarr** action, mount Prowlarr's `public` volume read-only for its API key, and manage their own application record through `reconcileProwlarrApplication`, exported from `startos/utils.ts` with `prowlarrApi`, `syncedApps` and `managedApplicationName`. The record:

- is named `<App> (StartOS)` (`Sonarr (StartOS)`, …), implementation Sonarr/Radarr/Lidarr, sync level **Full Sync**, with `baseUrl` and `prowlarrUrl` set to the two packages' bridge addresses (`http://10.0.3.1:<assigned port>`) and the app's API key. Other fields (sync categories, tags) are left as the user set them.
- is found by the id the app stored, by that name, or by the plain app name an earlier Prowlarr release used, and renamed on adoption.
- is written with `forceSave=true` and created disabled first, because Prowlarr runs a connection test on creating an enabled application and rejects it when the app is stopped.
- is deleted by the app when it disconnects, and by Prowlarr's `reconcile` whenever the app is not installed.

An app updated from a release that predates this has no connection decision yet. Once Prowlarr is reachable, it connects itself if Prowlarr already has a record for it and stays disconnected otherwise.

## Installation and First-Run Flow

Prowlarr's first-run "create credentials" modal is never shown: install generates the API key and pre-seeds `config.xml` with Forms authentication, so before a password is set `/` redirects to `/login` and no user exists to sign in as. A critical task holds the service until **Set Admin Password** has run. The first start applies that password.

## Actions

Four user-facing actions; all may run while Prowlarr is running or stopped. Sonarr, Radarr and Lidarr are connected from their own **Connect Prowlarr** action.

- **Set Admin Password** (`set-admin-password`, shown as **Reset Admin Password** once set) — run on first install and whenever the user has lost the password. Generates a 32-character password, stores it, and returns `admin` plus the password, once. If Prowlarr is running it restarts (a few seconds) and the new password applies on start; if stopped, it applies on the next start. Every run invalidates the previous password.
- **Connect Byparr / Disconnect Byparr** (`connect-byparr`) — run it once an indexer fails with a Cloudflare error; run it again to disconnect. Toggles `byparrConnected`, which declares the dependency and has `reconcile` create or delete the `Byparr` indexer proxy on the next start. Every run restarts Prowlarr if running.
- **Connect NZBGet / Disconnect NZBGet** — run it once NZBGet is set up with a news server, so releases grabbed in Prowlarr's search go to NZBGet; run it again to disconnect. Toggles `nzbgetConnected`, which declares the dependency and has `reconcile` create or delete the `NZBGet (StartOS)` download client on the next start. Every run restarts Prowlarr if running, and a second run undoes the selection. Disconnecting deletes only that client; download clients with other names and the synced apps are untouched. Nothing to redo when NZBGet's admin password changes: the client uses NZBGet's separate restricted credentials.
- **Connect qBittorrent / Disconnect qBittorrent** — run it so torrents grabbed in Prowlarr's search go to qBittorrent; run it again to disconnect. Toggles `qbittorrentConnected`, which declares the dependency and has `reconcile` create or delete the `qBittorrent (StartOS)` download client on the next start. Every run restarts Prowlarr if running. Disconnecting deletes only that client. Nothing to redo when qBittorrent's password or API key changes: a new key restarts Prowlarr, which updates the client.

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

A restored instance needs nothing re-entered: the admin password, API key and Byparr, NZBGet and qBittorrent connections come back with `store.json`. The `public` volume is not backed up: init regenerates its derived `api-key` from the restored store. On the first start `reconcile` reconciles the managed Byparr proxy and NZBGet and qBittorrent clients with their live addresses and credentials. Sonarr, Radarr and Lidarr rewrite their own records on their next start.

## Limitations and Differences

1. Authentication method, port, bind address, URL base, trusted networks and the API key are owned by the package; changing them in **Settings → General** reverts on the next start.
2. The admin username is always `admin`, and a password changed in the Prowlarr UI is reset to the stored one on the next start.
3. The **Sonarr (StartOS)**, **Radarr (StartOS)** and **Lidarr (StartOS)** application records have their name, URLs, API key and sync level re-asserted on every start of that app while connected; the **Byparr** indexer proxy has its host and `byparr` tag re-asserted on every Prowlarr start while connected, and the **NZBGet (StartOS)** and **qBittorrent (StartOS)** download clients their name, enabled state, host, port, SSL and credentials while connected.
4. Built-in updates are disabled (`UpdateMechanism=Docker`); Prowlarr updates with the package.
5. Only Sonarr, Radarr and Lidarr on the same server connect themselves. Shelfarr connects from its own **Connect Prowlarr** action for direct searches, not application sync. Other sync apps (Readarr, a Sonarr elsewhere) are added in Prowlarr's UI as upstream documents.

---

## Quick Reference for AI Consumers

```yaml
package_id: prowlarr
image: lscr.io/linuxserver/prowlarr
architectures: [x86_64, aarch64]
subcontainers: [prowlarr-sub]
volumes:
  main: /config (subpath config)
  public: not mounted (exported read-only to dependents)
file_models:
  - main/config/config.xml
  - main/store.json
  - public/api-key
startos_managed_env_vars:
  - PUID
  - PGID
  - TZ
dependencies: [byparr, nzbget, qbittorrent]
dependents_that_sync: [sonarr, radarr, lidarr]
interfaces:
  ui: { type: ui, port: 9696 }
actions:
  - set-admin-password
  - connect-byparr
  - connect-qbittorrent
  - connect-nzbget
tasks:
  - { action: set-admin-password, severity: critical }
health_checks:
  - primary
```
