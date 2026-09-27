import type { Feature } from '@jbrowse/core/util'

// A gene as the pins need it: its name, its span on the reference, and the
// exons of all its transcripts merged into one set of intervals.
export interface GeneModel {
  name: string
  refName: string
  start: number
  end: number
  strand: number
  exons: { start: number; end: number }[]
}

// The adapters whose tracks hold gene models, in the order the session's
// tracks are searched when no track is named.
export const GENE_ADAPTER_TYPES = new Set([
  'Gff3TabixAdapter',
  'Gff3Adapter',
  'GtfTabixAdapter',
  'GtfAdapter',
  'BigBedAdapter',
  'NCListAdapter',
])

const GENE_TRACK_HINT = /gene|refseq|gencode|ensembl|annotation/i

// Which of the session's tracks to read genes from: the named one, else the
// first gene-bearing track on the assembly whose name says it is annotation,
// else the first gene-bearing track at all.
export function pickGeneTrack<
  T extends { trackId: string; name?: string; adapterType: string },
>(tracks: T[], named: string) {
  if (named) {
    return tracks.find(t => t.trackId === named)
  }
  const candidates = tracks.filter(t => GENE_ADAPTER_TYPES.has(t.adapterType))
  return (
    candidates.find(t =>
      GENE_TRACK_HINT.test(`${t.trackId} ${t.name ?? ''}`),
    ) ?? candidates[0]
  )
}

type FeatureLike = Feature | Record<string, unknown>

function field(f: FeatureLike, name: string): unknown {
  return typeof (f as Feature).get === 'function'
    ? (f as Feature).get(name)
    : (f as Record<string, unknown>)[name]
}

function exonsOf(f: FeatureLike, into: { start: number; end: number }[]) {
  const type = field(f, 'type')
  if (type === 'exon') {
    into.push({
      start: field(f, 'start') as number,
      end: field(f, 'end') as number,
    })
  }
  const children = field(f, 'subfeatures') as FeatureLike[] | undefined
  for (const child of children ?? []) {
    exonsOf(child, into)
  }
}

function merged(intervals: { start: number; end: number }[]) {
  const sorted = [...intervals].sort((a, b) => a.start - b.start)
  const out: { start: number; end: number }[] = []
  for (const iv of sorted) {
    const last = out.at(-1)
    if (last && iv.start <= last.end) {
      last.end = Math.max(last.end, iv.end)
    } else {
      out.push({ ...iv })
    }
  }
  return out
}

// Genes from a track's features: every top-level feature, named by the first
// of gene_name, name and id it carries, with the exons found anywhere under it
// merged. A feature with no exons is one exon, its whole span.
export function geneModelsFrom(features: FeatureLike[]): GeneModel[] {
  const genes: GeneModel[] = []
  for (const f of features) {
    const name =
      (field(f, 'gene_name') as string | undefined) ??
      (field(f, 'name') as string | undefined) ??
      (field(f, 'id') as string | undefined)
    const start = field(f, 'start') as number
    const end = field(f, 'end') as number
    if (!name || !(end > start)) {
      continue
    }
    const exons: { start: number; end: number }[] = []
    exonsOf(f, exons)
    genes.push({
      name,
      refName: field(f, 'refName') as string,
      start,
      end,
      strand: (field(f, 'strand') as number | undefined) ?? 0,
      exons: exons.length ? merged(exons) : [{ start, end }],
    })
  }
  return genes
}
