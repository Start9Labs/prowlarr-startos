# Prowlarr

## Documentation

- [Quick Start Guide](https://github.com/Servarr/Wiki/blob/master/prowlarr/quick-start-guide.md) — adding indexers and connecting apps
- [Settings](https://github.com/Servarr/Wiki/blob/master/prowlarr/settings.md) — every page of the Settings menu explained
- [Indexers](https://github.com/Servarr/Wiki/blob/master/prowlarr/indexers.md) — adding and configuring indexers
- [FAQ](https://github.com/Servarr/Wiki/blob/master/prowlarr/faq.md) — common questions
- [Troubleshooting](https://github.com/Servarr/Wiki/blob/master/prowlarr/troubleshooting.md) — diagnosing indexer and sync problems

## What you get on StartOS

- The Prowlarr **Web UI**, protected by a login StartOS creates for you.
- A **Connect Apps** action that links Prowlarr to Sonarr, Radarr and Lidarr installed on this server, so compatible indexers you add in Prowlarr are synced to them automatically, and to Byparr, so Prowlarr can reach indexers behind Cloudflare challenges.
- A **Connect NZBGet** action that sends the Usenet releases you grab in Prowlarr's search to NZBGet on this server.

## Getting set up

1. Run **Set Admin Password**. Copy the username and password it shows you — this is the only time the password is displayed.
2. Start Prowlarr and open the **Web UI**. Sign in with those credentials.
3. Add your indexers under **Indexers → Add Indexer**.
4. If you use Sonarr, Radarr or Lidarr on this server, run **Connect Apps** and select them. Prowlarr then syncs your indexers to them; there are no API keys to copy.
5. If an indexer fails with a Cloudflare error, install Byparr, select it in **Connect Apps**, then edit that indexer in Prowlarr and add the **byparr** tag. Only indexers carrying that tag go through Byparr. Byparr's own instructions explain how to route the two apps so the challenge result is accepted.

## Using Prowlarr

### NZBGet downloads

Run **Connect NZBGet** to send manual Usenet grabs from Prowlarr's search results to NZBGet on this server. Configure your news server and shared download location in NZBGet first. The connection uses separate restricted credentials, so resetting NZBGet's admin password does not break it.

The initial category is `prowlarr`; keep it in NZBGet, or change it consistently in both services. **Disconnect NZBGet** restarts Prowlarr and removes only `NZBGet (StartOS)`, not manually named download clients or connected apps. Download clients for Sonarr, Radarr, Lidarr and Shelfarr are configured in those services independently; Prowlarr does not sync its downloader settings to them.

### Shelfarr searches

If you use Shelfarr on this server, run **Connect Prowlarr** in Shelfarr after adding your indexers here. The connection shares the API key automatically; there is no key to copy.

Shelfarr searches Prowlarr directly rather than receiving synced indexers. Do not look for Shelfarr in Prowlarr's **Connect Apps** action or add it under **Settings → Apps**: Prowlarr has no Shelfarr sync provider. The connection shares Prowlarr's API key, not your admin password.

### Actions

- **Set Admin Password** / **Reset Admin Password** — generates a new password for the `admin` account. Run it again whenever you need a new one; the old password stops working and Prowlarr restarts.
- **Connect Apps** — select the apps on this server that Prowlarr keeps in sync with its indexers, and Byparr. Selecting Byparr adds an indexer proxy named **Byparr** under **Settings → Indexers** and a **byparr** tag; deselecting it removes that proxy, and tagged indexers then go back to connecting directly. Prowlarr restarts when the selection changes, and a selected app must be running for its indexers to sync. Deselecting an app stops the syncing, but the indexers Prowlarr already added to that app stay there and keep searching through Prowlarr. To remove them, delete the indexers whose names end in **(Prowlarr)** in that app's **Settings → Indexers**.
- **Connect NZBGet** / **Disconnect NZBGet** — adds NZBGet on this server as the download client for Usenet releases you grab in Prowlarr, or removes it. Prowlarr restarts.

## Limitations

- The login, port, and API key are managed by StartOS. Changing authentication, the port, the URL base, or regenerating the API key in Prowlarr's **Settings → General** is undone the next time Prowlarr starts.
- The applications named **Sonarr**, **Radarr** and **Lidarr** that Connect Apps creates are managed by StartOS. Edits to their address, API key, or sync level in **Settings → Apps** are undone the next time Prowlarr starts while that app is connected.
- The **Byparr** indexer proxy is managed by StartOS too. Its address and its **byparr** tag are restored the next time Prowlarr starts while Byparr is connected; other settings, such as the request timeout, are yours.
- The **NZBGet (StartOS)** download client is managed by StartOS as well. Its address and login are restored, and it is enabled again, the next time Prowlarr starts while NZBGet is connected; other settings, such as the category, are yours. To stop using it, run **Disconnect NZBGet**.
