export const CLINVAR_BUILDS = ['GRCh38', 'GRCh37'] as const

export type ClinVarBuild = (typeof CLINVAR_BUILDS)[number]

const BUILD_NAMES: Record<ClinVarBuild, readonly string[]> = {
  GRCh38: ['grch38', 'hg38'],
  GRCh37: ['grch37', 'hg19'],
}

// Every version of NCBI's human reference series, by its revision history
// (measured 2026-10-10): GRCh37 through GRCh37.p13, then GRCh38 through
// GRCh38.p14. The series is GRC's lineage, so a later version may be a new
// major; it stays unrecognised until it is checked.
const ACCESSION_VERSIONS: Record<
  ClinVarBuild,
  Record<'GCF' | 'GCA', readonly [number, number]>
> = {
  GRCh37: { GCF: [13, 25], GCA: [1, 14] },
  GRCh38: { GCF: [26, 40], GCA: [15, 29] },
}

function isBuildAccession(build: ClinVarBuild, name: string) {
  const match = /^(GCF|GCA)_000001405\.(\d+)$/i.exec(name)
  const prefix = match?.[1]?.toUpperCase()
  if (prefix !== 'GCF' && prefix !== 'GCA') {
    return false
  }
  const [first, last] = ACCESSION_VERSIONS[build][prefix]
  const version = Number(match?.[2])
  return version >= first && version <= last
}

/**
 * The ClinVar build an assembly is, by its name or any alias: `hg38`,
 * `GRCh38.p14` and `GCF_000001405.40` are GRCh38. Undefined for any other
 * assembly, which NCBI publishes no ClinVar VCF for.
 */
export function clinVarBuild(
  assemblyNames: readonly string[],
): ClinVarBuild | undefined {
  const names = assemblyNames.map(n => n.toLowerCase())
  return CLINVAR_BUILDS.find(
    build =>
      BUILD_NAMES[build].some(prefix =>
        names.some(n => n === prefix || n.startsWith(`${prefix}.`)),
      ) || assemblyNames.some(n => isBuildAccession(build, n)),
  )
}

export function clinVarVcfUrl(build: ClinVarBuild) {
  return `https://ftp.ncbi.nlm.nih.gov/pub/clinvar/vcf_${build}/clinvar.vcf.gz`
}

/**
 * Whether a refName is a mitochondrion ClinVar's VCF for the build does not
 * number. Both VCFs number the rCRS as `MT`, which is GRCh38's chrM and
 * GRCh37's own `MT`, but hg19's chrM is NC_001807, a different 16571-base
 * sequence.
 */
export function isUnnumberedMitochondrion(
  refName: string,
  build: ClinVarBuild,
) {
  return build === 'GRCh37' && /^(chrM|M|NC_001807(\.\d+)?)$/i.test(refName)
}

/**
 * The name NCBI's VCF gives a chromosome: `1`..`22`, `X`, `Y` and `MT`.
 * Undefined for a mitochondrion the build's VCF does not number.
 */
export function clinVarRefName(refName: string, build: ClinVarBuild) {
  if (isUnnumberedMitochondrion(refName, build)) {
    return undefined
  }
  const bare = refName.replace(/^chr/i, '')
  return bare === 'M' ? 'MT' : bare
}

/** A single-base substitution, at its 0-based genome position */
export interface ClinVarSnv {
  start: number
  ref: string
  alt: string
}

const BASE = /^[ACGT]$/

function infoField(info: string, key: string) {
  return new RegExp(`(?:^|;)${key}=([^;]*)`).exec(info)?.[1]
}

/**
 * The substitution a ClinVar VCF line records, when ClinVar's aggregate
 * germline classification calls it pathogenic or likely pathogenic and it is
 * missense on some transcript. `CLNSIG` joins classifications with `/`, `|`
 * and `,` (`Pathogenic/Likely_pathogenic`, `Pathogenic,_low_penetrance`);
 * `Conflicting_classifications_of_pathogenicity` holds no such term, so a
 * conflicted call does not count.
 */
export function parseClinVarSnv(line: string): ClinVarSnv | undefined {
  const [, pos, , ref, alt, , , info = ''] = line.split('\t')
  const significance = infoField(info, 'CLNSIG')?.split(/[/|,]/)
  const consequences = infoField(info, 'MC')?.split(',')
  return pos &&
    ref &&
    alt &&
    BASE.test(ref) &&
    BASE.test(alt) &&
    significance?.some(s => s === 'Pathogenic' || s === 'Likely_pathogenic') &&
    consequences?.some(c => c.endsWith('|missense_variant'))
    ? { start: +pos - 1, ref, alt }
    : undefined
}

const COMPLEMENT: Record<string, string> = { A: 'T', C: 'G', G: 'C', T: 'A' }

/**
 * How many distinct missense substitutions ClinVar calls pathogenic or likely
 * pathogenic at each 0-based residue of a transcript. Each substitution is
 * translated on this transcript's own codon: `p2gCodon` (g2p_mapper's, 0-based)
 * lists a codon's genome positions in reading order, so a codon split by an
 * intron and a minus-strand codon both read right. A variant the VCF calls
 * missense on another transcript but that is synonymous, nonsense or outside
 * the coding sequence of this one does not count, nor does one whose `REF`
 * disagrees with the genome. Two codon changes to one amino acid count once.
 * Every residue with a whole codon gets a count, zero included, so a residue
 * ClinVar has no call for is told apart from one the structure cannot place.
 * `checked` counts the variants that landed on a codon, and `disagreeing`
 * those whose `REF` the genome does not spell.
 */
export function pathogenicCountByTranscriptPosition({
  variants,
  p2gCodon,
  strand,
  genomeBase,
  codonTable,
}: {
  variants: Iterable<ClinVarSnv>
  p2gCodon: Record<number, number[]>
  strand: number
  /** the forward-strand base at a 0-based genome position */
  genomeBase: (position: number) => string | undefined
  codonTable: Record<string, string>
}) {
  const oriented = (base: string | undefined) =>
    base && strand === -1 ? COMPLEMENT[base] : base
  const codons = new Map<number, string[]>()
  const residueAt = new Map<number, { residue: number; index: number }>()
  for (const [residue, positions] of Object.entries(p2gCodon)) {
    const bases = positions.map(p => oriented(genomeBase(p)?.toUpperCase()))
    if (bases.length === 3 && bases.every(b => b !== undefined)) {
      codons.set(+residue, bases)
      positions.forEach((position, index) => {
        residueAt.set(position, { residue: +residue, index })
      })
    }
  }
  const substitutions = new Map<number, Set<string>>()
  let checked = 0
  let disagreeing = 0
  for (const { start, ref, alt } of variants) {
    const at = residueAt.get(start)
    const codon = at ? codons.get(at.residue) : undefined
    if (!at || !codon) {
      continue
    }
    checked++
    if (codon[at.index] !== oriented(ref)) {
      disagreeing++
      continue
    }
    const mutated = codon.with(at.index, oriented(alt) ?? '')
    const from = codonTable[codon.join('')]
    const to = codonTable[mutated.join('')]
    if (from && to && from !== to && from !== '*' && to !== '*') {
      const seen = substitutions.get(at.residue) ?? new Set()
      seen.add(to)
      substitutions.set(at.residue, seen)
    }
  }
  const byPosition: ReadonlyMap<number, number> = new Map(
    [...codons.keys()]
      .toSorted((a, b) => a - b)
      .map(residue => [residue, substitutions.get(residue)?.size ?? 0]),
  )
  return { byPosition, checked, disagreeing }
}

/**
 * Whether the genome under a transcript is some other build than the VCF's:
 * most of at least ten variants disagree with it on their `REF`. A few
 * disagreements are a reference correction or a stray record; most mean
 * every count would be zero for the wrong reason.
 */
export function isWrongBuild({
  checked,
  disagreeing,
}: {
  checked: number
  disagreeing: number
}) {
  return checked >= 10 && disagreeing / checked > 0.5
}
