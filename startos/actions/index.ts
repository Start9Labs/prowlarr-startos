import { sdk } from '../sdk'
import { connectByparr } from './connectByparr'
import { connectNzbget } from './connectNzbget'
import { connectQbittorrent } from './connectQbittorrent'
import { setAdminPassword } from './setAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(setAdminPassword)
  .addAction(connectByparr)
  .addAction(connectQbittorrent)
  .addAction(connectNzbget)
