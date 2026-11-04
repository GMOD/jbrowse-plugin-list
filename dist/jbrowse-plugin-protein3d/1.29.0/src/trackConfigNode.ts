import {
  hydrateTrackConfig,
  isConfigurationModel,
} from '@jbrowse/core/configuration'
import { getEnv } from '@jbrowse/core/util'

import type { AnyTrackConfig } from '@jbrowse/core/configuration'
import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree'

// A session track is a frozen entry holding only what was written: an adapter
// given as a track-level `uri` and a slot at its default are absent until the
// entry hydrates, so a slot read goes through the node
export function trackConfigNode(
  session: IAnyStateTreeNode,
  conf: AnyTrackConfig,
) {
  return isConfigurationModel(conf)
    ? conf
    : hydrateTrackConfig(getEnv(session).pluginManager, conf)
}
