import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Dependents mount only `startos/share/` read-only; private state stays outside it.
export const apiKeyFile = FileHelper.string(
  { base: sdk.volumes.startos, subpath: '/share/api-key' },
  z.string(),
)
