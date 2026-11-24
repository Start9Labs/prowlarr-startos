import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_3_0_2_5780_1 } from './v3.0.2.5780_1'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_3_0_2_5780_1],
})
