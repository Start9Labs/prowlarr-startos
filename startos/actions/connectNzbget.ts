import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const connectNzbget = sdk.Action.withoutInput(
  'connect-nzbget',
  async ({ effects }) => {
    const connected = await storeJson
      .read((s) => s.nzbgetConnected)
      .const(effects)
    return {
      name: connected ? i18n('Disconnect NZBGet') : i18n('Connect NZBGet'),
      description: i18n(
        'Send manual Usenet grabs from Prowlarr to NZBGet. Changing the connection restarts Prowlarr.',
      ),
      warning: connected
        ? i18n('Removes only the NZBGet (StartOS) download client.')
        : null,
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },
  async ({ effects }) =>
    storeJson.update(
      effects,
      (s) => s && { ...s, nzbgetConnected: !s.nzbgetConnected },
    ),
)
