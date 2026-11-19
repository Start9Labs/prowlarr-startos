import { legacyApplicationsFile } from '../fileModels/legacyApplications'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { legacyApplicationIds, syncedAppIds } from '../utils'

export const shareLegacyApplications = sdk.setupOnInit(async (effects) => {
  const store = await storeJson
    .read((s) => ({
      connectedApps: s.legacyConnectedApps,
      ids: legacyApplicationIds(s),
    }))
    .const(effects)
  if (!store) return
  const connectedApps = store.connectedApps
  await legacyApplicationsFile.write(
    effects,
    connectedApps === null
      ? {}
      : Object.fromEntries(
          syncedAppIds.map((id) => [
            id,
            { connected: connectedApps.includes(id), appId: store.ids[id] },
          ]),
        ),
  )
})
