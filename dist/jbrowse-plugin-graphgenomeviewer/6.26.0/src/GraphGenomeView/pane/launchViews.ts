import {
  backboneNodes,
  backboneSpan,
} from '@jbrowse/bandage-core/anchoredNodes'
import { nodeReferenceSpan } from '@jbrowse/bandage-core/referenceSpan'
import { readConfObject } from '@jbrowse/core/configuration'
import { getContainingView, getSession } from '@jbrowse/core/util'

import { withGraphViews } from './graphViews'
import {
  contributingAssemblies,
  nodeOwnLocation,
  resolveContributors,
  resolveLocationAssembly,
} from '../../launchFromGraph/contributors'
import {
  canonicalAssemblyName,
  paddedLocation,
  withReferenceRegion,
} from '../../launchFromGraph/launchFromGraph'
import { linearViewTarget } from '../../launchFromGraph/linearViewTarget'
import { GENE_ADAPTER_TYPES, pickGeneTrack } from '../genes/geneFeatures'
import { isLinearHost } from '../host'

import type { LinearHost } from '../host'

export const withLaunchViews = withGraphViews
  .views(self => ({
    // Every assembly this graph names a segment from, with the locus each one
    // contributes here. rGFA's SN tag is what makes this knowable: the graph
    // states its own contributors, so the view can offer a way out to each of
    // them without consulting an alignment.
    //
    // Gaps larger than the backbone span split a contributor's segments into
    // separate loci and the widest wins, so a sample that also contributes
    // sequence from a distant duplication is launched at the locus on screen
    // rather than at the union of the two.
    get contributingAssemblies() {
      const graph = self.graph
      const backbone = graph ? backboneNodes(graph) : []
      return graph
        ? contributingAssemblies(graph, {
            maxGap: backbone.length > 0 ? backboneSpan(backbone) : Infinity,
          })
        : []
    },
  }))
  .views(self => ({
    // A node's PanSN sample as an assembly this session can open, or
    // undefined. The graph's spelling and the assembly's need not agree:
    // HPRC writes `CHM13` where the assembly is UCSC's `hs1`. The track the
    // graph was cut from states that pairing in its `assemblyNameToPanSN`,
    // so its map is read first, then `assemblyManager`'s names and aliases.
    //
    // `has` before `get`, deliberately: `get` reports an unknown name to
    // `Core-handleUnrecognizedAssembly`, which asks every installed plugin to
    // go supply it, and this is a probe run for hundreds of haplotypes per
    // graph.
    get assemblyResolver() {
      const { assemblyManager } = getSession(self)
      const panSN = self.sourceAdapter?.assemblyNameToPanSN as
        Record<string, string> | undefined
      const byPrefix = new Map(
        Object.entries(panSN ?? {}).map(([asm, prefix]) => [prefix, asm]),
      )
      const loaded = (name: string | undefined) =>
        name !== undefined && assemblyManager.has(name)
          ? (assemblyManager.get(name)?.name ?? name)
          : undefined
      return (sample: string) => loaded(byPrefix.get(sample)) ?? loaded(sample)
    },
    // Each assembly's gene track among the session's tracks, picked as the
    // backbone's is, so a walk row can read its haplotype's own annotation.
    // One pass over the tracks, not one per row.
    get geneTracksByAssembly() {
      const byAssembly = new Map<
        string,
        { trackId: string; name: string; adapterType: string }[]
      >()
      for (const t of getSession(self).tracks) {
        const adapterType = (readConfObject(t, 'adapter') as { type: string })
          .type
        if (!GENE_ADAPTER_TYPES.has(adapterType)) {
          continue
        }
        const track = {
          trackId: t.trackId as string,
          name: readConfObject(t, 'name') as string,
          adapterType,
        }
        for (const name of readConfObject(t, 'assemblyNames') as string[]) {
          const asm = canonicalAssemblyName(getSession(self), name)
          byAssembly.set(asm, [...(byAssembly.get(asm) ?? []), track])
        }
      }
      return new Map(
        [...byAssembly].flatMap(([asm, tracks]) => {
          const picked = pickGeneTrack(tracks, '')
          return picked ? [[asm, picked] as const] : []
        }),
      )
    },
  }))
  .views(self => ({
    // The contributors a view can actually be opened on: those naming an
    // assembly this session has loaded. Every strain of an E. coli pangenome
    // demo is its own assembly, so all of them resolve; an HPRC graph names
    // hundreds of haplotypes that no session loads, so only the reference
    // does.
    get launchableAssemblies() {
      return resolveContributors(
        withReferenceRegion(self.contributingAssemblies, self.graphRegion),
        self.assemblyResolver,
      )
    },
    // Whether there is a linear view this graph may draw a highlight into —
    // the paired one, or the session's only one on the reference assembly.
    // Read by the node menu, which offers the item only when it would land
    // somewhere.
    get canHighlightInLinearView() {
      const region = self.graphRegion
      return (
        region !== undefined &&
        linearViewTarget({
          views: [...getSession(self).views],
          connectedViewId: self.connectedViewId,
          assemblyName: region.assemblyName,
        }) !== undefined
      )
    },
    // Where one node can be opened: on its own assembly, and on the reference
    // the graph was cut against. Both are padded to a readable window — a
    // base-level allele is a few bp, and a linear view framed on exactly that
    // shows no context at all.
    nodeLaunchTargets(nodeId: string) {
      const node = self.nodeById?.get(nodeId)
      const own = node ? nodeOwnLocation(node) : undefined
      const ownAssembly = own
        ? resolveLocationAssembly(self.assemblyResolver, own)
        : undefined
      const region = self.graphRegion
      const nodeById = self.nodeById
      const neighbors = self.nodeNeighbors
      const span =
        region && nodeById && neighbors
          ? nodeReferenceSpan({ nodeId, nodeById, neighbors })
          : undefined
      const onReference =
        region && span
          ? {
              sample: region.assemblyName,
              haplotype: undefined,
              refName: region.refName,
              ...span,
            }
          : undefined
      return {
        own:
          own && ownAssembly
            ? { location: paddedLocation(own), assembly: ownAssembly }
            : undefined,
        reference:
          region && onReference
            ? {
                location: paddedLocation(onReference),
                assembly: region.assemblyName,
              }
            : undefined,
        // Unpadded: a mark is of the node, the same span its hover band
        // draws. The padding above is room to read a view opened on it.
        highlight:
          region && onReference
            ? { location: onReference, assembly: region.assemblyName }
            : undefined,
      }
    },
  }))
  .views(self => ({
    // The linear view this pane draws inside, when a display hosts it: x is
    // that view's window and the cut is re-made when the window leaves it.
    // A pane that is a view of its own has none.
    get host(): LinearHost | undefined {
      let view: unknown
      try {
        view = getContainingView(self)
      } catch {
        return undefined
      }
      return isLinearHost(view) ? view : undefined
    },
  }))
