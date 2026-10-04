import { mergeOverlappingByName } from '@jbrowse/bandage-core/genes/geneFiles'

import type { GeneModel } from '@jbrowse/bandage-core/genes/genePins'
import type { Feature } from '@jbrowse/core/util'

// The adapters whose tracks hold gene models, in the order the session's
// tracks are searched when no track is named.
export const GENE_ADAPTER_TYPES = new Set([
  'Gff3TabixAdapter',
  'Gff3Adapter',
  'BedTabixAdapter',
  'BedAdapter',
  'GtfTabixAdapter',
  'GtfAdapter',
  'BigBedAdapter',
  'NCListAdapter',
])

const GENE_TRACK_HINT = /gene|refseq|gencode|ensembl|annotation/i

// A BED track is as often peaks or repeats as genes, so one counts only where
// its name says it is annotation
const BED_ADAPTER_TYPES = new Set(['BedTabixAdapter', 'BedAdapter'])

// Which of the session's tracks to read genes from: the named one, else the
// first gene-bearing track on the assembly whose name says it is annotation,
// else the first non-BED gene-bearing track.
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
    ) ?? candidates.find(t => !BED_ADAPTER_TYPES.has(t.adapterType))
  )
}

type FeatureLike = Feature | Record<string, unknown>

function field(f: FeatureLike, name: string): unknown {
  return typeof (f as Feature).get === 'function'
    ? (f as Feature).get(name)
    : (f as Record<string, unknown>)[name]
}

// JBrowse's BED parser splits a coding BED12 block into CDS and UTR parts and
// keeps `exon` for non-coding ones, so all of them are exon
const EXON_PARTS = new Set([
  'exon',
  'CDS',
  'five_prime_UTR',
  'three_prime_UTR',
  'UTR',
])

function exonsOf(f: FeatureLike, into: { start: number; end: number }[]) {
  const type = field(f, 'type')
  if (typeof type === 'string' && EXON_PARTS.has(type)) {
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
// merged. A feature with no exons is one exon, its whole span. A BED track
// gives one feature per transcript, so a name's overlapping features merge,
// while its copies down the contig stay apart.
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
  return mergeOverlappingByName(genes)
}
