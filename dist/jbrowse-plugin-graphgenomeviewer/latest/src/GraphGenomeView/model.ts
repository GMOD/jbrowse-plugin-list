import { getRpcSessionId, getSession } from '@jbrowse/core/util'
import { addDisposer, isAlive } from '@jbrowse/mobx-state-tree'
import { reaction } from 'mobx'

import {
  configHaplotypes,
  graphReferenceAssembly,
  offReferenceProblem,
  walkIndexed,
} from '../graphTrackConfig'
import { canonicalAssemblyName } from '../launchFromGraph/launchFromGraph'
import { withLaunchActions } from './pane/launchActions'

import type { SubgraphCutOptions, SubgraphRegion } from '../GetSubgraph'
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
        ...(self.forcedByteBudget
          ? { forcedByteBudget: self.forcedByteBudget }
          : {}),
      }
    },
  }))
  .views(self => ({
    // `expandSamples` is left out: a sample filter alone fetches nothing, and
    // the walks it finds abridged join `expand`
    get cutKey() {
      const { expandSamples: _filter, ...fetched } = self.cutOptions
      return JSON.stringify(fetched)
    },
  }))
  .views(self => ({
    get cutStale() {
      return (
        self.cutKeyOnRecord !== undefined && self.cutKeyOnRecord !== self.cutKey
      )
    },
  }))
  .actions(self => ({
    markCut() {
      self.cutKeyOnRecord = self.cutKey
    },
    setSubgraphContext(hops: number) {
      self.subgraphContext = hops
    },
    setSubgraphHaplotypes(haplotypes: string[] | undefined) {
      self.subgraphHaplotypes = haplotypes
    },
    setHaplotypeNames(names: string[] | undefined) {
      self.haplotypeNames = names
    },
  }))
  .actions(self => ({
    // A failed read leaves the picker taking typed names
    async fetchHaplotypeNames(
      adapterConfig: Record<string, unknown>,
      signal?: AbortSignal,
    ) {
      try {
        const names = await getSession(self).rpcManager.call(
          getRpcSessionId(self),
          'GetGraphHaplotypes',
          // eslint-disable-next-line no-restricted-syntax -- a background read for the haplotype picker, which has no status line; the pane's belongs to the cut
          { adapterConfig, signal },
        )
        if (isAlive(self) && !signal?.aborted) {
          self.setHaplotypeNames(names)
        }
      } catch (e) {
        if (!signal?.aborted) {
          console.warn('[GraphGenomeView] no haplotype names', e)
        }
      }
    },
  }))
  .actions(self => ({
    afterAttach() {
      let namesRead: AbortController | undefined
      addDisposer(self, () => {
        namesRead?.abort()
      })
      addDisposer(
        self,
        reaction(
          () => {
            const adapter = self.sourceAdapter
            return adapter && walkIndexed(adapter) ? adapter : undefined
          },
          adapterConfig => {
            namesRead?.abort()
            namesRead = undefined
            self.setHaplotypeNames(undefined)
            if (adapterConfig) {
              namesRead = new AbortController()
              void self.fetchHaplotypeNames(adapterConfig, namesRead.signal)
            }
          },
          {
            fireImmediately: true,
            // a lane adapter's config is rebuilt whenever an assembly is
            // added, which would drop and re-read the names
            equals: (a, b) => JSON.stringify(a) === JSON.stringify(b),
            name: 'GraphHaplotypeNames',
          },
        ),
      )
      // A cut option changed by anything cuts again: a setting, the config
      // editor, undo or a session delta. A change of layout mode cuts through
      // relayout.
      addDisposer(
        self,
        reaction(
          () => ({ mode: self.chosenLayoutMode, key: self.cutKey }),
          (now, was) => {
            if (now.mode === was.mode && self.cutStale) {
              self.retryLoad()
            }
          },
          {
            equals: (a, b) => a.mode === b.mode && a.key === b.key,
            name: 'GraphCutOptions',
          },
        ),
      )
    },
  }))

export type GraphPaneModel = Instance<typeof GraphPane>
