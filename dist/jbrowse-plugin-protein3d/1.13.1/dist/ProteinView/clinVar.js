const CLINVAR_BUILDS = ['GRCh38', 'GRCh37'];
const BUILD_NAMES = {
    GRCh38: ['grch38', 'hg38'],
    GRCh37: ['grch37', 'hg19'],
};
// Every version of NCBI's human reference series, by its revision history
// (measured 2026-10-10): GRCh37 through GRCh37.p13, then GRCh38 through
// GRCh38.p14. The series is GRC's lineage, so a later version may be a new
// major; it stays unrecognised until it is checked.
const ACCESSION_VERSIONS = {
    GRCh37: { GCF: [13, 25], GCA: [1, 14] },
    GRCh38: { GCF: [26, 40], GCA: [15, 29] },
};
function isBuildAccession(build, name) {
    const match = /^(GCF|GCA)_000001405\.(\d+)$/i.exec(name);
    const prefix = match?.[1]?.toUpperCase();
    if (prefix !== 'GCF' && prefix !== 'GCA') {
        return false;
    }
    const [first, last] = ACCESSION_VERSIONS[build][prefix];
    const version = Number(match?.[2]);
    return version >= first && version <= last;
}
/**
 * The ClinVar build an assembly is, by its name or any alias: `hg38`,
 * `GRCh38.p14` and `GCF_000001405.40` are GRCh38. Undefined for any other
 * assembly, which NCBI publishes no ClinVar VCF for.
 */
export function clinVarBuild(assemblyNames) {
    const names = assemblyNames.map(n => n.toLowerCase());
    return CLINVAR_BUILDS.find(build => BUILD_NAMES[build].some(prefix => names.some(n => n === prefix || n.startsWith(`${prefix}.`))) || assemblyNames.some(n => isBuildAccession(build, n)));
}
export function clinVarVcfUrl(build) {
    return `https://ftp.ncbi.nlm.nih.gov/pub/clinvar/vcf_${build}/clinvar.vcf.gz`;
}
/**
 * Whether a refName is a mitochondrion ClinVar's VCF for the build does not
 * number. Both VCFs number the rCRS as `MT`, which is GRCh38's chrM and
 * GRCh37's own `MT`, but hg19's chrM is NC_001807, a different 16571-base
 * sequence.
 */
export function isUnnumberedMitochondrion(refName, build) {
    return build === 'GRCh37' && /^(chrM|M|NC_001807(\.\d+)?)$/i.test(refName);
}
/**
 * The name NCBI's VCF gives a chromosome: `1`..`22`, `X`, `Y` and `MT`.
 * Undefined for a mitochondrion the build's VCF does not number.
 */
export function clinVarRefName(refName, build) {
    if (isUnnumberedMitochondrion(refName, build)) {
        return undefined;
    }
    const bare = refName.replace(/^chr/i, '');
    return bare === 'M' ? 'MT' : bare;
}
const BASE = /^[ACGT]$/;
function infoField(info, key) {
    return new RegExp(`(?:^|;)${key}=([^;]*)`).exec(info)?.[1];
}
/**
 * The substitution a ClinVar VCF line records, when it is a single base,
 * missense on some transcript, and carries a germline classification.
 * `CLNSIG` joins classifications with `/`, `|` and `,`
 * (`Pathogenic/Likely_pathogenic`, `Pathogenic,_low_penetrance`).
 */
export function parseClinVarMissense(line) {
    const [, pos, id, ref, alt, , , info = ''] = line.split('\t');
    const significance = infoField(info, 'CLNSIG')?.split(/[/|,]/);
    const consequences = infoField(info, 'MC')?.split(',');
    return pos &&
        ref &&
        alt &&
        BASE.test(ref) &&
        BASE.test(alt) &&
        significance &&
        consequences?.some(c => c.endsWith('|missense_variant'))
        ? {
            start: +pos - 1,
            ref,
            alt,
            id: id && id !== '.' ? id : undefined,
            significance,
        }
        : undefined;
}
/**
 * Whether ClinVar's aggregate germline classification calls a variant
 * pathogenic or likely pathogenic.
 * `Conflicting_classifications_of_pathogenicity` holds no such term, so a
 * conflicted call does not count.
 */
export function isPathogenic(significance) {
    return significance.some(s => s === 'Pathogenic' || s === 'Likely_pathogenic');
}
export const CLINVAR_CATEGORIES = [
    'pathogenic',
    'likely pathogenic',
    'conflicting',
    'uncertain',
    'likely benign',
    'benign',
    'other',
];
const CATEGORY_TERMS = [
    ['Pathogenic', 'pathogenic'],
    ['Likely_pathogenic', 'likely pathogenic'],
    ['Conflicting_classifications_of_pathogenicity', 'conflicting'],
    ['Uncertain_significance', 'uncertain'],
    ['Benign', 'benign'],
    ['Likely_benign', 'likely benign'],
];
/** The one category a classification is shown under, its gravest term
 * deciding: `Benign/Likely_benign` is benign, `Likely_pathogenic|risk_factor`
 * likely pathogenic. */
export function clinVarCategory(significance) {
    return (CATEGORY_TERMS.find(([term]) => significance.includes(term))?.[1] ?? 'other');
}
const COMPLEMENT = { A: 'T', C: 'G', G: 'C', T: 'A' };
/**
 * Each variant translated on this transcript's own codon: `p2gCodon`
 * (g2p_mapper's, 0-based) lists a codon's genome positions in reading order,
 * so a codon split by an intron and a minus-strand codon both read right. A
 * variant the VCF calls missense on another transcript but that is
 * synonymous, nonsense or outside the coding sequence of this one is left
 * out, as is one whose `REF` disagrees with the genome. `residues` lists
 * every residue with a whole codon, so a residue ClinVar has no call for is
 * told apart from one the structure cannot place. `checked` counts the
 * variants that landed on a codon, and `disagreeing` those whose `REF` the
 * genome does not spell.
 */
export function placeMissenseOnTranscript({ variants, p2gCodon, strand, genomeBase, codonTable, }) {
    const oriented = (base) => base && strand === -1 ? COMPLEMENT[base] : base;
    const codons = new Map();
    const residueAt = new Map();
    for (const [residue, positions] of Object.entries(p2gCodon)) {
        const bases = positions.map(p => oriented(genomeBase(p)?.toUpperCase()));
        if (bases.length === 3 && bases.every(b => b !== undefined)) {
            codons.set(+residue, bases);
            positions.forEach((position, index) => {
                residueAt.set(position, { residue: +residue, index });
            });
        }
    }
    const placed = [];
    let checked = 0;
    let disagreeing = 0;
    for (const variant of variants) {
        const { start, ref, alt } = variant;
        const at = residueAt.get(start);
        const codon = at ? codons.get(at.residue) : undefined;
        if (!at || !codon) {
            continue;
        }
        checked++;
        if (codon[at.index] !== oriented(ref)) {
            disagreeing++;
            continue;
        }
        const mutated = codon.with(at.index, oriented(alt) ?? '');
        const from = codonTable[codon.join('')];
        const to = codonTable[mutated.join('')];
        if (from && to && from !== to && from !== '*' && to !== '*') {
            placed.push({ variant, residue: at.residue, from, to });
        }
    }
    return {
        placed,
        residues: [...codons.keys()].toSorted((a, b) => a - b),
        checked,
        disagreeing,
    };
}
/**
 * How many distinct substitutions land on each residue: two codon changes to
 * one amino acid count once, and every residue with a whole codon gets a
 * count, zero included.
 */
export function substitutionCountByResidue(placed, residues) {
    const substitutions = new Map();
    for (const { residue, to } of placed) {
        const seen = substitutions.get(residue) ?? new Set();
        seen.add(to);
        substitutions.set(residue, seen);
    }
    return new Map(residues.map(residue => [residue, substitutions.get(residue)?.size ?? 0]));
}
/**
 * Whether the genome under a transcript is some other build than the VCF's:
 * most of at least ten variants disagree with it on their `REF`. A few
 * disagreements are a reference correction or a stray record; most mean
 * every count would be zero for the wrong reason.
 */
export function isWrongBuild({ checked, disagreeing, }) {
    return checked >= 10 && disagreeing / checked > 0.5;
}
