import type { Feature } from '@jbrowse/core/util'

export interface RepeatCall {
  bp: number
  // TRGT's `SD`. Zero means the allele is a copy of the one the reads did
  // support, so its length states nothing about a second haplotype; absent
  // where the genotyper writes no such field.
  spanningReads?: number
  // the PanSN haplotype a phased genotype puts this allele on
  haplotype?: number
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
  // (TRGT) or a genotype over VCF 4.5 <CNV:TR> alleles; absent from a
  // catalogue.
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

function strings(value: unknown) {
  const raw: unknown[] = Array.isArray(value)
    ? value
    : String(value ?? '').split(',')
  return raw.map(one => {
    const text = String(one ?? '').trim()
    return text === '' || text === '.' ? undefined : text
  })
}

const TANDEM_REPEAT = '<CNV:TR>'

// Each ALT allele's length, off VCF 4.5's flattened list-of-lists: RN says how
// many RUS/RUL/RUC/RB entries each allele takes, and the allele's bases are
// its runs' RB, or unit length times count where RB is missing. An allele that
// is not <CNV:TR>, or has a run stating neither, has none.
function tandemAlleleBp(f: FeatureLike) {
  const alts = strings(own(f, 'ALT'))
  if (!alts.includes(TANDEM_REPEAT)) {
    return undefined
  }
  const rn = numbers(field(f, 'RN'))
  const rus = strings(field(f, 'RUS'))
  const rul = numbers(field(f, 'RUL'))
  const ruc = numbers(field(f, 'RUC'))
  const rb = numbers(field(f, 'RB'))
  let k = 0
  return alts.map((alt, i) => {
    const n = rn[i] ?? (alt === TANDEM_REPEAT ? 1 : 0)
    let bp = 0
    let known = 0
    for (let j = 0; j < n; j++, k++) {
      const motif = rus[k]
      const unitLength =
        rul[k] ?? (motif && IUPAC.test(motif) ? motif.length : undefined)
      const count = ruc[k]
      const runBp =
        rb[k] ??
        (unitLength && count !== undefined
          ? Math.round(unitLength * count)
          : undefined)
      if (runBp !== undefined) {
        bp += runBp
        known++
      }
    }
    return alt === TANDEM_REPEAT && n > 0 && known === n ? bp : undefined
  })
}

// A sample's alleles through its genotype: 0 is the reference's, an index
// past it the ALT allele's. A phased genotype's k-th allele is PanSN
// haplotype k, the order vg deconstruct writes an assembly's haplotypes in.
function genotyped(
  gt: string | undefined,
  alleleBp: (number | undefined)[],
  referenceBp: number,
) {
  const phased = gt?.includes('|')
  return (gt ?? '').split(/[/|]/).flatMap((index, k): RepeatCall[] => {
    const i = Number(index)
    const bp = i > 0 ? alleleBp[i - 1] : referenceBp
    if (!Number.isInteger(i) || bp === undefined) {
      return []
    }
    return [{ bp, ...(phased ? { haplotype: k + 1 } : {}) }]
  })
}

function callsOf(
  f: FeatureLike,
  alleleBp: (number | undefined)[] | undefined,
  referenceBp: number,
) {
  const samples = own(f, 'samples') as
    Record<string, Record<string, unknown>> | undefined
  const called: Record<string, RepeatCall[]> = {}
  for (const [sample, fields] of Object.entries(samples ?? {})) {
    const reads = numbers(fields.SD)
    const lengths = numbers(fields.AL).flatMap((bp, i) =>
      bp !== undefined && bp > 0
        ? [reads[i] === undefined ? { bp } : { bp, spanningReads: reads[i] }]
        : [],
    )
    const calls =
      lengths.length > 0 || !alleleBp
        ? lengths
        : genotyped(strings(fields.GT)[0], alleleBp, referenceBp)
    if (calls.length > 0) {
      called[sample] = calls
    }
  }
  return Object.keys(called).length > 0 ? called : undefined
}

// A <CNV:TR> record's POS is the base before the array and SVLEN the
// reference allele's length, while a VCF feature starts at that padding base.
function spanOf(f: FeatureLike, tandem: boolean) {
  const start = field(f, 'start') as number
  const end = field(f, 'end') as number
  const svlen = numbers(field(f, 'SVLEN'))[0]
  return tandem && svlen !== undefined
    ? { start: start + 1, end: start + 1 + svlen }
    : { start, end }
}

export function repeatArraysFrom(features: FeatureLike[]): RepeatArray[] {
  const arrays: RepeatArray[] = []
  for (const f of features) {
    const alleleBp = tandemAlleleBp(f)
    const { start, end } = spanOf(f, alleleBp !== undefined)
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
      calls: callsOf(f, alleleBp, end - start),
    })
  }
  return arrays.sort((a, b) => a.start - b.start)
}
