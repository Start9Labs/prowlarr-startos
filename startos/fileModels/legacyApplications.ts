import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { legacyApplicationsShape } from '../utils'

export const legacyApplicationsFile = FileHelper.json(
  { base: sdk.volumes.public, subpath: '/legacy-applications.json' },
  legacyApplicationsShape,
)
