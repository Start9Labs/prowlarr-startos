import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const connectByparr = sdk.Action.withoutInput(
  'connect-byparr',
  async ({ effects }) => {
    const connected = await storeJson
      .read((s) => s.byparrConnected)
      .const(effects)
    return {
      name: connected ? i18n('Disconnect Byparr') : i18n('Connect Byparr'),
      description: i18n(
        'Solve Cloudflare challenges for indexers tagged byparr through Byparr. Changing the connection restarts Prowlarr.',
      ),
      warning: connected
        ? i18n(
            'Removes the Byparr indexer proxy; tagged indexers connect directly again.',
          )
        : null,
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },
  async ({ effects }) =>
    storeJson.update(
      effects,
      (s) => s && { ...s, byparrConnected: !s.byparrConnected },
    ),
)
