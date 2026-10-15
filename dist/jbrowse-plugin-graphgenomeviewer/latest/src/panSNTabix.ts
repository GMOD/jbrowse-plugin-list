import { TabixIndexedFile } from '@gmod/tabix'
import {
  panSNContig,
  panSNMatchesPrefix,
  resolvePanSNPrefix,
} from '@jbrowse/bandage-core/pansn'
import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { cachedSetup } from '@jbrowse/core/data_adapters/BaseAdapter'
import { openLocation, openTabixIndexFilehandle } from '@jbrowse/core/util/io'
import { refNameLookup, resolveRefName } from '@jbrowse/graph-walks'
import { types } from '@jbrowse/mobx-state-tree'

import { bytesForRegions } from './tabixRange.ts'

import type {
  BaseFeatureDataAdapter,
  BaseOptions,
} from '@jbrowse/core/data_adapters/BaseAdapter'
import type { Region } from '@jbrowse/core/util/types'

// What a tabix-indexed graph track answers about its own reference names, for
// the two adapters that read one: `RgfaTabixAdapter` over segments and links,
// and `MinigraphBubbleAdapter` over bubbles. @jbrowse/graph-walks builds the
// name lookup.
//
// A class rather than a base class, for the reason ComparativeAdapterBase.ts
// records: a base generic over the config cannot prove a slot name to
// `getConf`, so the adapter
// keeps the two lines that read its own slots and hands over the file. Reading
// `assemblyNameToPanSN` IS hoistable, because every schema here declares it and
// `resolvePanSNPrefix` is already generic over the base adapter type.

// A file slot whose default is a url, '' for none
export const fileLocationSlot = (uri: string) => ({
  type: 'fileLocation' as const,
  defaultValue: { uri, locationType: 'UriLocation' },
})

/**
 * The index slot `openTabixSlot` reads: its own `location` and `indexType`
 */
export const tabixIndexSchema = (name: string, defaultUri = '') =>
  ConfigurationSchema(name, {
    /**
     * #slot
     */
    indexType: {
      model: types.enumeration('IndexType', ['TBI', 'CSI']),
      type: 'stringEnum',
      defaultValue: 'TBI',
    },
    /**
     * #slot
     */
    location: fileLocationSlot(defaultUri),
  })

// The index slot's snapshot for a file whose `.tbi`, or `.csi`, sits beside it
export function tbiBeside(uri: string, baseUri: unknown, csi: unknown) {
  return {
    indexType: csi ? 'CSI' : 'TBI',
    location: { uri: `${uri}.${csi ? 'csi' : 'tbi'}`, baseUri },
  }
}

// The `walksUri` shorthand: `<walksUri>.walks.bed.gz` and its index
export function walksLocations(snap: Record<string, unknown>) {
  const { walksUri, baseUri, csi } = snap
  if (typeof walksUri !== 'string') {
    return snap
  }
  const walks = `${walksUri}.walks.bed.gz`
  return {
    ...snap,
    walksLocation: { uri: walks, baseUri },
    walksIndex: tbiBeside(walks, baseUri, csi),
  }
}

// One indexed file from the pair of slots that names it: the data location, and
// an index slot holding its own `location` and `indexType`. Paths, so the pair
// can sit in a sub-schema.
export function openTabixSlot(
  adapter: BaseFeatureDataAdapter,
  location: string[],
  index: string[],
) {
  const pm = adapter.pluginManager
  return new TabixIndexedFile({
    filehandle: openLocation(adapter.getConf(location), pm),
    ...openTabixIndexFilehandle(
      adapter.getConf([...index, 'location']),
      adapter.getConf([...index, 'indexType']),
      pm,
    ),
  })
}

/**
 * The reference-name half of a tabix graph track, against one indexed file.
 *
 * Constructed with the file the adapter's own slots opened, so this never reads
 * a slot whose name it cannot prove.
 */
export function unmappedRegionMessage(region: Region) {
  return `${region.assemblyName} ${region.refName} is not in this graph's index; a graph with PanSN names (GRCh38#0#chr1) needs ${region.assemblyName} mapped to its prefix in assemblyNameToPanSN`
}

export class PanSNRefNames {
  // Read once and shared by every query, so it takes on no caller's signal: a
  // track fetch the user panned away from once aborted the read a graph cut
  // was waiting on. cachedSetup rejects only the caller that aborts, keeps the
  // read going for the rest, and retries a failed read.
  private lookup = cachedSetup({
    setup: async opts =>
      refNameLookup(await this.file.getReferenceSequenceNames(opts)),
  })

  constructor(
    private file: TabixIndexedFile,
    private adapter: BaseFeatureDataAdapter,
  ) {}

  /**
   * The names the ASSEMBLY uses, not the graph's own.
   *
   * A minigraph graph's stable names are already bare (`chr6`) and pass
   * straight through; a Minigraph-Cactus graph's are PanSN, and returning
   * `GRCh38#0#chr6` here makes JBrowse decide the track has no data for `chr6`
   * and never query it — the graph view still worked, because it resolves per
   * region rather than through this list, which is exactly how the empty tracks
   * were spotted.
   */
  async assemblyRefNames(opts: BaseOptions = {}) {
    const names = await this.file.getReferenceSequenceNames(opts)
    const prefix = resolvePanSNPrefix(this.adapter, opts.assemblyName)
    const contigs = names
      .filter(n => panSNMatchesPrefix(n, prefix))
      .map(n => panSNContig(n))
    return contigs.length > 0 ? [...new Set(contigs)] : names
  }

  /**
   * The file's own stable name for a region, or undefined when it holds no
   * sequence answering to it.
   *
   * The graph's stable names may be PanSN (`GRCh38#0#chr1`), in which case the
   * assembly name is not the sample prefix; `assemblyNameToPanSN` maps the two,
   * the same slot and helper the all-vs-all PAF adapters use.
   */
  async resolve(region: Region, opts?: BaseOptions) {
    const lookup = await this.lookup(opts)
    return resolveRefName(
      lookup,
      resolvePanSNPrefix(this.adapter, region.assemblyName),
      region.refName,
    )
  }

  /**
   * `resolve`, throwing where every name in the file is PanSN and none carries
   * the region's prefix: the assembly is unmapped, which would otherwise read
   * as an empty track. A contig the file simply lacks, such as chrM, still
   * resolves to undefined, as it does in a graph whose reference is bare
   * (`chr1`) beside PanSN haplotypes.
   */
  async resolveMapped(region: Region, opts?: BaseOptions) {
    const refName = await this.resolve(region, opts)
    if (refName === undefined && region.assemblyName) {
      const names = await this.file.getReferenceSequenceNames(opts)
      const prefix = resolvePanSNPrefix(this.adapter, region.assemblyName)
      if (
        names.every(n => n.includes('#')) &&
        !names.some(n => panSNMatchesPrefix(n, prefix))
      ) {
        throw new Error(unmappedRegionMessage(region))
      }
    }
    return refName
  }

  /**
   * The compressed bytes a read of `regions` fetches from the file, as its
   * index estimates them, for the display's byte gate. `queryStart` moves a
   * region's start to where the read begins.
   */
  async regionBytes(
    regions: Region[],
    opts: BaseOptions = {},
    queryStart = async (start: number) => start,
  ) {
    const spans = []
    for (const region of regions) {
      const refName = await this.resolve(region, opts)
      if (refName !== undefined) {
        spans.push({
          refName,
          start: await queryStart(region.start),
          end: region.end,
        })
      }
    }
    return bytesForRegions(this.file, spans, opts)
  }
}
