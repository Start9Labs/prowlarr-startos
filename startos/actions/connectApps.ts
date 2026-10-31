import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  connectedApps: Value.multiselect({
    name: i18n('Apps'),
    description: i18n(
      'Apps on this server that Prowlarr keeps in sync with its indexers, and Byparr, which gets Prowlarr past Cloudflare challenges. Deselecting an app removes it from Prowlarr.',
    ),
    values: { sonarr: 'Sonarr', radarr: 'Radarr', byparr: 'Byparr' },
    default: [],
  }),
})

export const connectApps = sdk.Action.withInput(
  'connect-apps',
  async () => ({
    name: i18n('Connect Apps'),
    description: i18n(
      'Choose which apps on this server Prowlarr syncs its indexers to, and whether it solves Cloudflare challenges through Byparr. Changing the selection restarts Prowlarr.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async () => ({
    connectedApps: (await storeJson.read((s) => s.connectedApps).once()) ?? [],
  }),
  async ({ effects, input }) =>
    storeJson.merge(effects, { connectedApps: input.connectedApps }),
)
