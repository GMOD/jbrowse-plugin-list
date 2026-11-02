import { getSession } from '@jbrowse/core/util'

import {
  configHaplotypes,
  graphReferenceAssembly,
  offReferenceProblem,
} from '../graphTrackConfig'
import { canonicalAssemblyName } from '../launchFromGraph/launchFromGraph'
import { withLaunchActions } from './pane/launchActions'

import type { SubgraphCutOptions, SubgraphRegion } from '../GetSubgraph'
import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'
import type { Instance } from '@jbrowse/mobx-state-tree'

export { MAX_GRAPH_REGION_BP, fileName, formatSpanBp } from './pane/paneBase'

// The pane every graph drawing is: a view of its own, or a display inside a
// linear view. Built in stages under pane/, each extending the one before,
// and given here the cut options both hosts share.
export const GraphPane = withLaunchActions
  .views(self => ({
    // the config's defaultHaplotypes, which a cut is for until the user
    // picks others
    get trackHaplotypes(): string[] | undefined {
      const adapter = self.sourceAdapter
      return adapter && configHaplotypes(adapter)
    },
  }))
  .views(self => ({
    get cutHaplotypes() {
      return self.subgraphHaplotypes ?? self.trackHaplotypes
    },
    // Why the source track cannot cut `region`, which is a window on an
    // assembly other than the graph's reference. A track may name its
    // reference by an alias of the assembly the window is on.
    offReference(region: SubgraphRegion) {
      const track = self.sourceTrack
      const reference = track && graphReferenceAssembly(track)
      const session = getSession(self)
      return reference === undefined
        ? undefined
        : offReferenceProblem(
            canonicalAssemblyName(session, reference),
            canonicalAssemblyName(session, region.assemblyName),
          )
    },
    // A layout change that changes the cut options cuts the track again:
    // whole walks (cutsWholeWalksIn), or the walk-row step budget.
    cutChangedFrom(from: LayoutModeValue) {
      return (
        self.cutsWholeWalks !== self.cutsWholeWalksIn(from) ||
        (from === 'walkrows') !== (self.chosenLayoutMode === 'walkrows')
      )
    },
  }))
  .views(self => ({
    get cutOptions(): SubgraphCutOptions {
      return {
        hops: self.subgraphContext,
        haplotypes: self.cutHaplotypes,
        ...(self.chosenLayoutMode === 'walkrows'
          ? {
              walkRows: true,
              ...(self.walkRowSamples?.length
                ? { expandSamples: self.walkRowSamples }
                : {}),
            }
          : {}),
        ...(self.cutsWholeWalks ? { snarls: 'overlapping' as const } : {}),
        ...(self.expandedWalks.length > 0
          ? { expand: self.expandedWalks }
          : {}),
      }
    },
  }))

export type GraphPaneModel = Instance<typeof GraphPane>
