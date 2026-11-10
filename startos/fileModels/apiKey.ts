import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Dependents mount `public` read-only; private state stays outside it.
export const apiKeyFile = FileHelper.string(
  { base: sdk.volumes.public, subpath: '/api-key' },
  z.string(),
)
