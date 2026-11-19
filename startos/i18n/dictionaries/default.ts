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

  // actions/connectByparr.ts
  'Disconnect Byparr': 15,
  'Connect Byparr': 16,
  'Solve Cloudflare challenges for indexers tagged byparr through Byparr. Changing the connection restarts Prowlarr.': 17,
  'Removes the Byparr indexer proxy; tagged indexers connect directly again.': 18,

  // actions/connectNzbget.ts, actions/connectQbittorrent.ts
  'Disconnect NZBGet': 19,
  'Connect NZBGet': 20,
  'Send manual Usenet grabs from Prowlarr to NZBGet. Changing the connection restarts Prowlarr.': 21,
  'Removes only the NZBGet (StartOS) download client.': 22,
  'Disconnect qBittorrent': 23,
  'Connect qBittorrent': 24,
  'Send manual torrent grabs from Prowlarr to qBittorrent. Changing the connection restarts Prowlarr.': 25,
  'Removes only the qBittorrent (StartOS) download client.': 26,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
