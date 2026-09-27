import type { Feature } from '@jbrowse/core/util'

export interface RepeatCall {
  bp: number
  // TRGT's `SD`. Zero means the allele is a copy of the one the reads did
  // support, so its length states nothing about a second haplotype; absent
  // where the genotyper writes no such field.
  spanningReads?: number
}

// A tandem repeat array as the walk rows need it: its span on the reference,
// which is what the bars measure between, and its unit length, which is what
// they tile by. Read off whatever repeat annotation the session has, since the
// tools all state the same two facts under different names: VCF 4.5's
// `<CNV:TR>` allele gives `RUL` and `RUS` (one entry per repeat sequence,
// grouped by `RN`), UCSC simpleRepeat and TRF give `period` and the consensus
// `sequence`, TRGT gives `MOTIFS` and `TRID`, ExpansionHunter `RU` and `REPID`,
// HipSTR and GangSTR `PERIOD`, vamos its `motifs`. A VCF record's INFO is
// searched as well as its top level, and a list's first entry is the unit the
// bars tile by: for a compound array that is the first repeat sequence, which
// is the expanding one at every such locus in the common catalogues.
export interface RepeatArray {
  key: string
  name: string
  refName: string
  start: number
  end: number
  unit: number
  motif?: string
  // Each sample's genotyped alleles, from a genotyper's per-sample `AL`
  // (TRGT); absent from a catalogue.
  calls?: Record<string, RepeatCall[]>
}

export const REPEAT_ADAPTER_TYPES = new Set([
  'BedAdapter',
  'BedTabixAdapter',
  'BigBedAdapter',
  'VcfAdapter',
  'VcfTabixAdapter',
])

const REPEAT_TRACK_HINT =
  /repeat|tandem|\bstr\b|vntr|trf|trgt|vamos|expansion|microsat/i

export function pickRepeatTrack<
  T extends { trackId: string; name?: string; adapterType: string },
>(tracks: T[], named: string) {
  if (named) {
    return tracks.find(t => t.trackId === named)
  }
  const candidates = tracks.filter(t => REPEAT_ADAPTER_TYPES.has(t.adapterType))
  return candidates.find(t =>
    REPEAT_TRACK_HINT.test(`${t.trackId} ${t.name ?? ''}`),
  )
}

type FeatureLike = Feature | Record<string, unknown>

function own(f: FeatureLike, name: string): unknown {
  return typeof (f as Feature).get === 'function'
    ? (f as Feature).get(name)
    : (f as Record<string, unknown>)[name]
}

// A TRGT repeat catalogue is a BED whose name column packs the record:
// `ID=HTT;MOTIFS=CAG,CCG;STRUC=(CAG)nCAACAG(CCG)n`. Read as fields when it
// has that shape.
const PACKED_NAME = /^\w+=[^;]*(;\w+=[^;]*)*$/

function packedName(f: FeatureLike) {
  const name = own(f, 'name')
  if (typeof name !== 'string' || !PACKED_NAME.test(name)) {
    return undefined
  }
  return Object.fromEntries(
    name.split(';').map(pair => {
      const i = pair.indexOf('=')
      return [pair.slice(0, i), pair.slice(i + 1)]
    }),
  )
}

// A field at the feature's top level, in a VCF record's INFO, or in a packed
// name column, in that order.
function field(f: FeatureLike, name: string): unknown {
  const top = own(f, name)
  if (top !== undefined) {
    return top
  }
  const info = own(f, 'INFO') as Record<string, unknown> | undefined
  return info?.[name] ?? packedName(f)?.[name]
}

const MOTIF_FIELDS = [
  'RUS',
  'MOTIFS',
  'RU',
  'motifs',
  'motif',
  'sequence',
  'consensus',
]
const PERIOD_FIELDS = [
  'RUL',
  'period',
  'PERIOD',
  'consensusSize',
  'unit',
  'unitLength',
]
const NAME_FIELDS = ['TRID', 'REPID', 'VARID', 'ID', 'name', 'id']

// The first entry of a list-valued field, whether it arrived parsed or as
// the comma-joined text a VCF INFO or a BED column holds; VCF's missing "."
// counts as absent.
function first(f: FeatureLike, names: string[]) {
  for (const name of names) {
    const value = field(f, name)
    const one = String((Array.isArray(value) ? value[0] : value) ?? '')
      .split(',')[0]!
      .trim()
    if (one !== '' && one !== '.') {
      return one
    }
  }
  return undefined
}

const IUPAC = /^[ACGTURYSWKMBDHVN]+$/i

// The unit in bp: a stated period, else the length of the first motif.
export function repeatUnitOf(f: FeatureLike) {
  const period = Number(first(f, PERIOD_FIELDS))
  if (Number.isFinite(period) && period > 0) {
    return Math.round(period)
  }
  const motif = first(f, MOTIF_FIELDS)
  return motif && IUPAC.test(motif) ? motif.length : undefined
}

// A per-sample list field, parsed or as the comma-joined text a VCF column
// holds. A missing entry stays missing: read as 0, an absent `SD` would make
// every allele of every genotyper that writes no such field unspanned.
function numbers(value: unknown) {
  const raw: unknown[] = Array.isArray(value)
    ? value
    : String(value ?? '').split(',')
  return raw.map(one => {
    const n =
      one === '' || one === null || one === undefined ? NaN : Number(one)
    return Number.isFinite(n) ? n : undefined
  })
}

function callsOf(f: FeatureLike) {
  const samples = own(f, 'samples') as
    Record<string, Record<string, unknown>> | undefined
  const called: Record<string, RepeatCall[]> = {}
  for (const [sample, fields] of Object.entries(samples ?? {})) {
    const reads = numbers(fields.SD)
    const alleles = numbers(fields.AL).flatMap((bp, i) =>
      bp !== undefined && bp > 0
        ? [reads[i] === undefined ? { bp } : { bp, spanningReads: reads[i] }]
        : [],
    )
    if (alleles.length > 0) {
      called[sample] = alleles
    }
  }
  return Object.keys(called).length > 0 ? called : undefined
}

export function repeatArraysFrom(features: FeatureLike[]): RepeatArray[] {
  const arrays: RepeatArray[] = []
  for (const f of features) {
    const start = field(f, 'start') as number
    const end = field(f, 'end') as number
    const unit = repeatUnitOf(f)
    if (!(end > start) || unit === undefined) {
      continue
    }
    const refName = field(f, 'refName') as string
    const motif = first(f, MOTIF_FIELDS)
    const stated = first(f, NAME_FIELDS)
    arrays.push({
      key: `${refName}:${start}-${end}`,
      name:
        (stated && !PACKED_NAME.test(stated) ? stated : undefined) ??
        (motif && motif.length <= 12
          ? `(${motif})n`
          : `${refName}:${(start + 1).toLocaleString()}-${end.toLocaleString()}`),
      refName,
      start,
      end,
      unit,
      motif,
      calls: callsOf(f),
    })
  }
  return arrays.sort((a, b) => a.start - b.start)
}
