# Prowlarr

## Documentation

- [Quick Start Guide](https://github.com/Servarr/Wiki/blob/master/prowlarr/quick-start-guide.md) — adding indexers and connecting apps
- [Settings](https://github.com/Servarr/Wiki/blob/master/prowlarr/settings.md) — every page of the Settings menu explained
- [Indexers](https://github.com/Servarr/Wiki/blob/master/prowlarr/indexers.md) — adding and configuring indexers
- [FAQ](https://github.com/Servarr/Wiki/blob/master/prowlarr/faq.md) — common questions
- [Troubleshooting](https://github.com/Servarr/Wiki/blob/master/prowlarr/troubleshooting.md) — diagnosing indexer and sync problems

## What you get on StartOS

- The Prowlarr **Web UI**, protected by a login StartOS creates for you.
- A **Connect Apps** action that links Prowlarr to Sonarr and Radarr installed on this server, so every indexer you add in Prowlarr is synced to them automatically.

## Getting set up

1. Run **Set Admin Password**. Copy the username and password it shows you — this is the only time the password is displayed.
2. Start Prowlarr and open the **Web UI**. Sign in with those credentials.
3. Add your indexers under **Indexers → Add Indexer**.
4. If you use Sonarr or Radarr on this server, run **Connect Apps** and select them. Prowlarr then syncs your indexers to them; there are no API keys to copy.

## Using Prowlarr

### Actions

- **Set Admin Password** / **Reset Admin Password** — generates a new password for the `admin` account. Run it again whenever you need a new one; the old password stops working and Prowlarr restarts.
- **Connect Apps** — select the apps on this server that Prowlarr keeps in sync with its indexers. Prowlarr restarts when the selection changes, and a selected app must be running for its indexers to sync. Deselecting an app stops the syncing, but the indexers Prowlarr already added to that app stay there and keep searching through Prowlarr. To remove them, delete the indexers whose names end in **(Prowlarr)** in that app's **Settings → Indexers**.

## Limitations

- The login, port, and API key are managed by StartOS. Changing authentication, the port, the URL base, or regenerating the API key in Prowlarr's **Settings → General** is undone the next time Prowlarr starts.
- The applications named **Sonarr** and **Radarr** that Connect Apps creates are managed by StartOS. Edits to their address, API key, or sync level in **Settings → Apps** are undone the next time Prowlarr starts while that app is connected.
