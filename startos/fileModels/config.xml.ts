import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const configXml = FileHelper.xml(
  { base: sdk.volumes.main, subpath: '/config/config.xml' },
  z.looseObject({ Config: z.looseObject({}).catch({}) }),
  {
    parser: { parseTagValue: false, ignoreDeclaration: true },
    builder: { format: true },
  },
)
