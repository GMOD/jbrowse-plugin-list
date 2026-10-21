import { cutsWholeWalks as wholeWalksRule } from '@jbrowse/bandage-core/layout/walkStrip'
import { layoutModeByValue } from '@jbrowse/bandage-core/layoutModes'
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
    // Walk rows, and the strip of them under a node layout, measure whole
    // walks, which a GBZ cut only follows when asked, so a layout change
    // that changes whether the drawing needs them cuts the track again.
    cutChangedFrom(from: LayoutModeValue) {
      const before = wholeWalksRule(layoutModeByValue(from), {
        walkStrip: self.walkStrip,
        host: !!self.host,
      })
      return (
        self.cutsWholeWalks !== before ||
        (from === 'walkrows') !== (self.chosenLayoutMode === 'walkrows')
      )
    },
  }))
  .views(self => ({
    get cutOptions(): SubgraphCutOptions {
      return {
        hops: self.subgraphContext,
        haplotypes: self.cutHaplotypes,
        ...(self.chosenLayoutMode === 'walkrows' ? { walkRows: true } : {}),
        ...(self.cutsWholeWalks ? { snarls: 'overlapping' as const } : {}),
        ...(self.expandedWalks.length > 0
          ? { expand: self.expandedWalks }
          : {}),
      }
    },
  }))

export type GraphPaneModel = Instance<typeof GraphPane>
