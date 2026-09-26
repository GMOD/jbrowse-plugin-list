import { TabixIndexedFile } from '@gmod/tabix'
import { cachedSetup } from '@jbrowse/core/data_adapters/BaseAdapter'
import { openLocation, openTabixIndexFilehandle } from '@jbrowse/core/util/io'

import {
  panSNContig,
  panSNHaplotype,
  panSNMatchesPrefix,
  panSNSample,
  resolvePanSNPrefix,
} from './pansn.ts'

import type {
  BaseFeatureDataAdapter,
  BaseOptions,
} from '@jbrowse/core/data_adapters/BaseAdapter'
import type { Region } from '@jbrowse/core/util/types'

// What a tabix-indexed graph track answers about its own reference names, for
// the two adapters that read one: `RgfaTabixAdapter` over segments and links,
// and `MinigraphBubbleAdapter` over bubbles.
//
// The two carried this verbatim — the opener, the cached lookup, `getRefNames`,
// `resolve` — and the bubble adapter reached across into
// `RgfaTabixAdapter/rgfaBed.ts` for the lookup half, which is a BED row grammar
// and not this. Same reason `ComparativeAdapterBase` exists: the answers that do
// not depend on which config slot names the file belong in one place.
//
// A class rather than a base class, for the reason that file records: a base
// generic over the config cannot prove a slot name to `getConf`, so the adapter
// keeps the two lines that read its own slots and hands over the file. Reading
// `assemblyNameToPanSN` IS hoistable, because every schema here declares it and
// `resolvePanSNPrefix` is already generic over the base adapter type.

// Tabix's own cache, per file. Large because a graph query is a scattered read
// over a small index: the segment and link files for a 5 Mb window are tens of
// kB of compressed blocks, and re-fetching them per pan is the cost this avoids.
const CHUNK_CACHE_SIZE = 50 * 2 ** 20

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
    chunkCacheSize: CHUNK_CACHE_SIZE,
  })
}

// A tab can occur in neither half — both come out of BED columns.
function qualifiedKey(assemblyName: string, refName: string) {
  return `${assemblyName}\t${refName}`
}

// The stable sequences in these files are usually PanSN (`K12#1#chr`) while the
// assembly asking for them uses the bare contig (`chr` in assembly `K12`). One
// map answers both spellings: the raw tabix name, plus a sample+contig key for
// PanSN names.
export function buildRefNameLookup(tabixRefNames: string[]) {
  const lookup = new Map<string, string>()
  for (const name of tabixRefNames) {
    lookup.set(name, name)
    const sample = panSNSample(name)
    if (sample !== name) {
      const contig = panSNContig(name)
      lookup.set(qualifiedKey(sample, contig), name)
      const haplotype = panSNHaplotype(name)
      if (haplotype !== undefined) {
        lookup.set(qualifiedKey(haplotype, contig), name)
      }
    }
  }
  return lookup
}

export function resolveRefName(
  lookup: Map<string, string>,
  assemblyName: string,
  refName: string,
) {
  const qualified = lookup.get(qualifiedKey(assemblyName, refName))
  return qualified === undefined ? lookup.get(refName) : qualified
}

/**
 * The reference-name half of a tabix graph track, against one indexed file.
 *
 * Constructed with the file the adapter's own slots opened, so this never reads
 * a slot whose name it cannot prove.
 */
export class PanSNRefNames {
  // Read once and shared by every query, so it takes on no caller's signal: a
  // track fetch the user panned away from once aborted the read a graph cut
  // was waiting on. cachedSetup withholds the signal and retries a failed read.
  private lookup = cachedSetup({
    setup: async opts =>
      buildRefNameLookup(await this.file.getReferenceSequenceNames(opts)),
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
    return contigs.length > 0 ? contigs : names
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
}
