import { withLaunchActions } from './pane/launchActions'

import type { Instance } from '@jbrowse/mobx-state-tree'

export {
  DEFAULT_MAX_GRAPH_NODES,
  MAX_GRAPH_REGION_BP,
  fileName,
  formatSpanBp,
} from './pane/paneBase'

// The pane every graph drawing is: a view of its own, or a display inside a
// linear view. Built in stages under pane/, each extending the one before.
export function GraphPaneMixin() {
  return withLaunchActions
}

export type GraphPaneModel = Instance<typeof withLaunchActions>
