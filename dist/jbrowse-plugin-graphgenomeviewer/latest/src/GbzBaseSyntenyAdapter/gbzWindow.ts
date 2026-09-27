import { panSNMatchesPrefix, panSNSample } from '../pansn.ts'

import type { GBZBase, PathName, PathQuery, RangeOptions } from '@gmod/gbz-base'

// A window of a gbz-base graph cut to GFA, with no host in it: the adapter
// and a standalone page open the database their own way and share this.

export class NoReferenceSampleError extends Error {
  override name = 'NoReferenceSampleError'

  constructor(anchor: string, referenceSamples: string[]) {
    super(
      referenceSamples.length === 0
        ? `the graph names no reference sample (gbwt_reference_samples) and the anchor "${anchor}" maps to none; set referenceSample`
        : `the anchor "${anchor}" is none of the graph's reference samples (${referenceSamples.join(', ')}); set referenceSample or map it through assemblyNameToPanSN`,
    )
  }
}

export class NodeLimitError extends Error {
  override name = 'NodeLimitError'

  constructor(limit: number, windowBp: number, fitsBp: number) {
    super(
      `this ${windowBp.toLocaleString()} bp window reads more than nodeLimit (${limit.toLocaleString()}) graph nodes; zoom in to about ${fitsBp.toLocaleString()} bp or raise nodeLimit`,
    )
  }
}

export function haplotypePrefix(name: Pick<PathName, 'sample' | 'haplotype'>) {
  return `${name.sample}#${name.haplotype}`
}

// Whether a walk is one of the haplotypes asked for, by PanSN prefix at sample
// (`HG002`) or haplotype (`HG002#1`) depth; undefined wants every one.
export function haplotypeWanted(name: PathName, wanted: string[] | undefined) {
  const prefix = haplotypePrefix(name)
  return (
    wanted === undefined ||
    wanted.some(candidate => panSNMatchesPrefix(prefix, candidate))
  )
}

export async function referenceSamplesOf(db: GBZBase) {
  return ((await db.tag('gbwt_reference_samples')) ?? '')
    .split(/\s+/)
    .filter(sample => sample !== '')
}

const SAMPLE_ALIASES: Record<string, string> = {
  hg38: 'grch38',
  hg19: 'grch37',
  hs1: 'chm13',
  't2t-chm13': 'chm13',
  chm13v2: 'chm13',
}

function aliasedSample(anchorSample: string, referenceSamples: string[]) {
  const lower = anchorSample.toLowerCase()
  const alias = SAMPLE_ALIASES[lower]
  return (
    referenceSamples.find(s => s === anchorSample) ??
    referenceSamples.find(s => s.toLowerCase() === lower) ??
    referenceSamples.find(s => s.toLowerCase() === alias)
  )
}

export function resolveReferenceSample({
  configured,
  anchorPrefix,
  referenceSamples,
}: {
  configured: string
  anchorPrefix: string
  referenceSamples: string[]
}) {
  if (configured !== '') {
    return configured
  }
  const sample =
    aliasedSample(panSNSample(anchorPrefix), referenceSamples) ??
    (referenceSamples.length === 1 ? referenceSamples[0] : undefined)
  if (sample === undefined) {
    throw new NoReferenceSampleError(anchorPrefix, referenceSamples)
  }
  return sample
}

// The indexed reference path a window on `refName` resolves against, or
// undefined when the reference sample has no indexed path by that contig.
// gbz-base spans the path's fragments itself from here.
export async function referencePathQuery(
  db: GBZBase,
  referenceSample: string,
  refName: string,
): Promise<PathQuery | undefined> {
  const path = (await db.paths()).find(
    p =>
      p.isIndexed &&
      p.name.sample === referenceSample &&
      p.name.contig === refName,
  )
  return path
    ? {
        sample: path.name.sample,
        contig: refName,
        haplotype: path.name.haplotype,
      }
    : undefined
}

// gbz-base reports the node limit with how far along the reference the walk
// had got when it tripped; a window that fits is that far, with a margin, or
// half the window when the limit tripped while extending past the reference.
export function nodeLimitError(
  error: unknown,
  limit: number,
  windowBp: number,
) {
  const isLimit =
    error instanceof Error &&
    (error.name === 'SubgraphLimitError' ||
      /^Subgraph size limit of \d+ nodes exceeded/.test(error.message))
  if (!isLimit) {
    return undefined
  } else {
    const walked = (error as { walkedBp?: unknown }).walkedBp
    const fits =
      typeof walked === 'number' && walked > 0
        ? Math.floor(walked * 0.8)
        : Math.floor(windowBp / 2)
    return new NodeLimitError(limit, windowBp, Math.max(fits, 1))
  }
}

export interface GbzWindowOptions {
  context: number
  snarls: RangeOptions['snarls']
  limit: number
  keep?: (name: PathName) => boolean
  signal?: AbortSignal
}

// The reference walk, the snarls in the window, and one W line per haplotype
// walk (the reference walk first), PanSN-named when the database carries the
// haplotype index. Empty when the query names no indexed path.
export async function cutWindowGFA(
  db: GBZBase,
  query: PathQuery | undefined,
  start: number,
  end: number,
  { keep, ...opts }: GbzWindowOptions,
) {
  const subgraph = query
    ? await db
        .getSubgraphForRange(query, start, end, {
          ...opts,
          haplotypes: 'all',
          ...(keep === undefined ? {} : { keep }),
        })
        .catch((error: unknown) => {
          throw nodeLimitError(error, opts.limit, end - start) ?? error
        })
    : undefined
  return subgraph ? subgraph.toGFA({ names: 'resolved' }) : ''
}
