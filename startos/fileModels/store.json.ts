import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const nullableId = z.number().nullable().catch(null)

const shape = z.looseObject({
  apiKey: z.string().catch(''),
  adminPassword: z.string().nullable().catch(null),
  byparrConnected: z.boolean().catch(false),
  // Application records an earlier release created for the synced apps.
  sonarrAppId: nullableId,
  radarrAppId: nullableId,
  lidarrAppId: nullableId,
  byparrProxyId: nullableId,
  nzbgetConnected: z.boolean().catch(false),
  nzbgetClientId: nullableId,
  qbittorrentConnected: z.boolean().catch(false),
  qbittorrentClientId: nullableId,
})

export type StoreType = z.infer<typeof shape>

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/store.json' },
  shape,
)
