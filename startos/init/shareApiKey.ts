import { apiKeyFile } from '../fileModels/apiKey'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const shareApiKey = sdk.setupOnInit(async (effects) => {
  const apiKey = await storeJson.read((s) => s.apiKey).const(effects)
  if (apiKey) await apiKeyFile.write(effects, apiKey)
})
