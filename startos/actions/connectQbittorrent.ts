import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const connectQbittorrent = sdk.Action.withoutInput(
  'connect-qbittorrent',
  async ({ effects }) => {
    const connected = await storeJson
      .read((s) => s.qbittorrentConnected)
      .const(effects)
    return {
      name: connected
        ? i18n('Disconnect qBittorrent')
        : i18n('Connect qBittorrent'),
      description: i18n(
        'Send manual torrent grabs from Prowlarr to qBittorrent. Changing the connection restarts Prowlarr.',
      ),
      warning: connected
        ? i18n('Removes only the qBittorrent (StartOS) download client.')
        : null,
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },
  async ({ effects }) =>
    storeJson.update(
      effects,
      (s) => s && { ...s, qbittorrentConnected: !s.qbittorrentConnected },
    ),
)
