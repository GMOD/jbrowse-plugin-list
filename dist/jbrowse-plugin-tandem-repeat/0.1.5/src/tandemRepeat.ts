import type { Feature } from '@jbrowse/core/util'

// A tandem repeat's alleles as the view draws them, read off one VCF 4.5
// <CNV:TR> record. Each ALT allele states its runs: RN says how many
// RUS/RUL/RUC/RB entries each allele takes, and RUB holds one entry per copy of
// every run. A sample's GT picks its alleles. RUNAME, outside the spec, names
// each run's unit beside its RUS, as tandem-repeat-vcf.mjs --unit-names writes.

// `count` copies of one unit, which indexes TandemRepeat.units
export interface RepeatRun {
  unit: number
  count: number
  bp: number
  // each copy's bases (RUB), where the record states them
  copyBp?: number[]
}

export interface RepeatUnit {
  length: number
  name?: string
  // copies across the record's alleles, which orders the units
  copies: number
  sequence?: string
}

// The reference allele states no runs, and an ALT allele of a record with no
// samples names no sample
export interface RepeatAllele {
  label: string
  sample?: string
  bp: number
  runs?: RepeatRun[]
}

export interface TandemRepeat {
  name: string
  refName: string
  start: number
  end: number
  // what the reference allele is ticked by
  unitLength?: number
  units: RepeatUnit[]
  alleles: RepeatAllele[]
}

type FeatureLike = Feature | Record<string, unknown>

function own(f: FeatureLike, name: string): unknown {
  return typeof (f as Feature).get === 'function'
    ? (f as Feature).get(name)
    : (f as Record<string, unknown>)[name]
}

function info(f: FeatureLike, name: string): unknown {
  return (own(f, 'INFO') as Record<string, unknown> | undefined)?.[name]
}

// A list field parsed, or as the comma-joined text a VCF column holds
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

const IUPAC = /^[ACGTURYSWKMBDHVN]+$/i
const TANDEM_REPEAT = '<CNV:TR>'

export function hasTandemAllele(f: FeatureLike) {
  return strings(own(f, 'ALT')).includes(TANDEM_REPEAT)
}

// Whether a record the menu knows only the type of could be <CNV:TR>: JBrowse
// types that allele by its first level, CNV
export function mayStateRepeat(type: string | undefined) {
  return type?.split(',').includes('copy_number_variation') ?? false
}

interface ParsedRun {
  key: string
  length: number
  name?: string
  sequence?: string
  count: number
  bp: number
  copyBp?: number[]
}

// Each ALT allele's runs; undefined for an allele that is not <CNV:TR> or has a
// run stating no unit
function tandemAlleles(f: FeatureLike) {
  const alts = strings(own(f, 'ALT'))
  const rn = numbers(info(f, 'RN'))
  const rus = strings(info(f, 'RUS'))
  const runame = strings(info(f, 'RUNAME'))
  const rul = numbers(info(f, 'RUL'))
  const ruc = numbers(info(f, 'RUC'))
  const rb = numbers(info(f, 'RB'))
  const rub = numbers(info(f, 'RUB')).filter(bp => bp !== undefined)
  const counted = ruc.every(Number.isInteger)
  let k = 0
  let copy = 0
  return alts.map((alt, i) => {
    const n = rn[i] ?? (alt === TANDEM_REPEAT ? 1 : 0)
    const runs: ParsedRun[] = []
    for (let j = 0; j < n; j++, k++) {
      const stated = rus[k]
      const sequence = stated && IUPAC.test(stated) ? stated : undefined
      const length = rul[k] ?? sequence?.length
      const name = runame[k] && runame[k] !== '.' ? runame[k] : undefined
      const bp = rb[k]
      const count =
        ruc[k] ?? (length && bp !== undefined ? bp / length : undefined)
      if (length && count !== undefined) {
        const copyBp =
          counted && rub.length > 0 ? rub.slice(copy, copy + count) : undefined
        runs.push({
          key: sequence ?? String(length),
          length,
          ...(name ? { name } : {}),
          ...(sequence ? { sequence } : {}),
          count,
          bp: bp ?? Math.round(length * count),
          ...(copyBp?.length === count ? { copyBp } : {}),
        })
      }
      copy += count ?? 0
    }
    return alt === TANDEM_REPEAT && runs.length === n ? runs : undefined
  })
}

function unitsOf(alleles: (ParsedRun[] | undefined)[]) {
  const units = new Map<string, RepeatUnit & { key: string }>()
  for (const { key, length, name, sequence, count } of alleles.flatMap(
    runs => runs ?? [],
  )) {
    const known = units.get(key)
    const copies = (known?.copies ?? 0) + count
    const named = known?.name ?? name
    units.set(key, {
      key,
      length,
      ...(named ? { name: named } : {}),
      copies,
      ...(sequence ? { sequence } : {}),
    })
  }
  return [...units.values()].sort(
    (a, b) =>
      b.copies - a.copies || a.length - b.length || a.key.localeCompare(b.key),
  )
}

// A stated unit length, else the length of the first unit sequence
function unitLengthOf(f: FeatureLike) {
  const rul = numbers(info(f, 'RUL')).find(n => n !== undefined)
  if (rul) {
    return rul
  }
  const rus = strings(info(f, 'RUS'))[0]
  return rus && IUPAC.test(rus) ? rus.length : undefined
}

// A phased genotype's k-th allele is PanSN haplotype k, the order vg
// deconstruct writes an assembly's haplotypes in
function labelOf(sample: string, k: number, called: number, phased: boolean) {
  if (phased) {
    return `${sample}#${k + 1}`
  }
  return called > 1 ? `${sample} (${k + 1})` : sample
}

function sampleAlleles(
  f: FeatureLike,
  alleles: (ParsedRun[] | undefined)[],
  referenceBp: number,
) {
  const samples = own(f, 'samples') as
    Record<string, Record<string, unknown>> | undefined
  const out: {
    label: string
    sample: string
    bp: number
    runs?: ParsedRun[]
  }[] = []
  for (const [sample, fields] of Object.entries(samples ?? {})) {
    const gt = strings(fields.GT)[0] ?? ''
    const phased = gt.includes('|')
    const called = gt.split(/[/|]/).flatMap((index, k) => {
      const i = Number(index)
      const runs = i > 0 ? alleles[i - 1] : undefined
      if (!Number.isInteger(i) || (i > 0 && !runs)) {
        return []
      }
      return [
        runs
          ? { k, bp: runs.reduce((s, r) => s + r.bp, 0), runs }
          : { k, bp: referenceBp },
      ]
    })
    for (const { k, ...allele } of called) {
      out.push({
        label: labelOf(sample, k, called.length, phased),
        sample,
        ...allele,
      })
    }
  }
  return out
}

// The record's alleles, one per called haplotype, or the ALT alleles of a
// record with no samples; undefined when no <CNV:TR> allele states its runs.
// POS is the base before the array and SVLEN the reference allele's length,
// while a VCF feature starts at that padding base.
export function tandemRepeatOf(f: FeatureLike): TandemRepeat | undefined {
  const alleles = tandemAlleles(f)
  if (!alleles.some(runs => runs !== undefined)) {
    return undefined
  }
  const refName = own(f, 'refName') as string
  const start = (own(f, 'start') as number) + 1
  const svlen = numbers(info(f, 'SVLEN'))[0]
  const end = svlen === undefined ? (own(f, 'end') as number) : start + svlen
  const called = sampleAlleles(f, alleles, end - start)
  const drawn =
    called.length > 0
      ? called
      : alleles.flatMap((runs, i) =>
          runs
            ? [
                {
                  label: `ALT ${i + 1}`,
                  bp: runs.reduce((s, r) => s + r.bp, 0),
                  runs,
                },
              ]
            : [],
        )
  const units = unitsOf(alleles)
  const index = new Map(units.map((u, i) => [u.key, i]))
  return {
    name:
      strings(own(f, 'name'))[0] ??
      `${refName}:${(start + 1).toLocaleString()}-${end.toLocaleString()}`,
    refName,
    start,
    end,
    unitLength: unitLengthOf(f),
    units: units.map(({ key: _key, ...unit }) => unit),
    alleles: drawn.map(({ runs, ...allele }) => ({
      ...allele,
      ...(runs
        ? {
            runs: runs.map(
              ({ key, length: _length, name: _n, sequence: _s, ...run }) => ({
                unit: index.get(key)!,
                ...run,
              }),
            ),
          }
        : {}),
    })),
  }
}
