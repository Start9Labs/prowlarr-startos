import { sdk } from '../sdk'
import { connectApps } from './connectApps'
import { setAdminPassword } from './setAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(setAdminPassword)
  .addAction(connectApps)
