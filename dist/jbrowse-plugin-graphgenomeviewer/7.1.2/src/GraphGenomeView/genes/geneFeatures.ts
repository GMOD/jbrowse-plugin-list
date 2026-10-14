import {
  mergeOverlappingByName,
  mergedIntervals,
} from '@jbrowse/bandage-core/genes/geneFiles'
import { readConfObject } from '@jbrowse/core/configuration'

import { REPEAT_TRACK_HINT } from '../repeats/repeatFeatures'
import { namedTrack, ownField, trackLabel } from '../trackFeatures'

import type { FeatureLike, TrackChoice } from '../trackFeatures'
import type { GeneModel } from '@jbrowse/bandage-core/genes/genePins'
import type { AnyConfigurationModel } from '@jbrowse/core/configuration'

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
// else the first non-BED gene-bearing track. A track whose name says repeats is
// never picked unnamed, as "RepeatMasker annotation" would be.
export function pickGeneTrack<T extends TrackChoice>(
  tracks: T[],
  named: string,
) {
  if (named) {
    return namedTrack(tracks, named)
  }
  const candidates = tracks.filter(
    t =>
      GENE_ADAPTER_TYPES.has(t.adapterType) &&
      !REPEAT_TRACK_HINT.test(trackLabel(t)),
  )
  return (
    candidates.find(t => GENE_TRACK_HINT.test(trackLabel(t))) ??
    candidates.find(t => !BED_ADAPTER_TYPES.has(t.adapterType))
  )
}

interface LaneView {
  tracks?: readonly {
    configuration: AnyConfigurationModel
    displays: readonly { configuration: AnyConfigurationModel }[]
  }[]
}

// The `filter` of the gene track's lane in the view the graph is drawn in, so
// the chips name what the lane draws. None where the view shows no such lane,
// or has no tracks, as a graph genome view of its own.
export function laneFilters(view: object, trackId: string | undefined) {
  const lane = (view as LaneView).tracks?.find(
    t => readConfObject(t.configuration, 'trackId') === trackId,
  )?.displays[0]
  return lane
    ? ((readConfObject(lane.configuration, 'filter') as string[] | undefined) ??
        [])
    : []
}

// Records spanning a whole sequence, the types the GFF3 adapter declines to
// widen a fetch for. RefSeq opens every molecule with a `region` named
// ANONYMOUS.
const WHOLE_SEQUENCE_TYPES = new Set([
  'chromosome',
  'region',
  'contig',
  'supercontig',
  'scaffold',
])

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
  const type = ownField(f, 'type')
  if (typeof type === 'string' && EXON_PARTS.has(type)) {
    into.push({
      start: ownField(f, 'start') as number,
      end: ownField(f, 'end') as number,
    })
  }
  const children = ownField(f, 'subfeatures') as FeatureLike[] | undefined
  for (const child of children ?? []) {
    exonsOf(child, into)
  }
}

// Genes from a track's features: every top-level feature but a whole-sequence
// record, named by the first of gene_name, name, gene and gene_id it carries,
// with the exons found anywhere under it merged. A feature with no exons is one exon,
// its whole span. A BED track gives one feature per transcript, so a name's
// overlapping features merge, while its copies down the contig stay apart.
// UCSC's ncbiRefSeq.gff gene records carry their symbol only as gene_id. A
// feature with none of those names is left out: its raw ID, RefSeq's
// `id-NC_000913.3:1978503..1979270`, only restates where it is.
export function geneModelsFrom(features: FeatureLike[]): GeneModel[] {
  const genes: GeneModel[] = []
  for (const f of features) {
    const name =
      (ownField(f, 'gene_name') as string | undefined) ??
      (ownField(f, 'name') as string | undefined) ??
      (ownField(f, 'gene') as string | undefined) ??
      (ownField(f, 'gene_id') as string | undefined)
    const start = ownField(f, 'start') as number
    const end = ownField(f, 'end') as number
    if (
      !name ||
      !(end > start) ||
      WHOLE_SEQUENCE_TYPES.has(ownField(f, 'type') as string)
    ) {
      continue
    }
    const exons: { start: number; end: number }[] = []
    exonsOf(f, exons)
    genes.push({
      name,
      refName: ownField(f, 'refName') as string,
      start,
      end,
      strand: (ownField(f, 'strand') as number | undefined) ?? 0,
      exons: exons.length ? mergedIntervals(exons) : [{ start, end }],
    })
  }
  return mergeOverlappingByName(genes)
}
