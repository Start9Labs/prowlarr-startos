import { sdk } from '../sdk'
import { connectApps } from './connectApps'
import { connectNzbget } from './connectNzbget'
import { connectQbittorrent } from './connectQbittorrent'
import { setAdminPassword } from './setAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(setAdminPassword)
  .addAction(connectApps)
  .addAction(connectQbittorrent)
  .addAction(connectNzbget)
