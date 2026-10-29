import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const nullableId = z.number().nullable().catch(null)

const shape = z.looseObject({
  apiKey: z.string().catch(''),
  adminPassword: z.string().nullable().catch(null),
  connectedApps: z.array(z.enum(['sonarr', 'radarr'])).catch([]),
  sonarrAppId: nullableId,
  radarrAppId: nullableId,
})

export type StoreType = z.infer<typeof shape>

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/store.json' },
  shape,
)
