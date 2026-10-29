import { utils } from '@start9labs/start-sdk'
import { configXml } from '../fileModels/config.xml'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return
  await storeJson.merge(effects, {
    apiKey: utils.getDefaultString({ charset: 'a-f,0-9', len: 32 }),
  })
  await configXml.merge(effects, { Config: { AnalyticsEnabled: 'False' } })
})
