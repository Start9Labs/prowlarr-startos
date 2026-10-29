export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Prowlarr!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'The Prowlarr web interface': 5,

  // init/watchAdminPassword.ts
  'Set the admin password before signing in': 6,

  // actions/setAdminPassword.ts
  'Set Admin Password': 7,
  'Reset Admin Password': 8,
  'Generate a new random password for the Prowlarr admin account.': 9,
  'Replaces the current admin password. The old password stops working, and Prowlarr restarts.': 10,
  'Login Credentials': 11,
  'Use these credentials to sign in to Prowlarr.': 12,
  Username: 13,
  Password: 14,

  // actions/connectApps.ts
  Apps: 15,
  'Apps on this server that Prowlarr keeps in sync with its indexers. Deselecting an app removes it from Prowlarr.': 16,
  'Connect Apps': 17,
  'Choose which apps on this server Prowlarr syncs its indexers to. Changing the selection restarts Prowlarr.': 18,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
