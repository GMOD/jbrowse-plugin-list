export const VARIANT_EFFECT_SCHEMES = ['alphamissense', 'clinvar'];
export function isVariantEffectScheme(scheme) {
    return VARIANT_EFFECT_SCHEMES.some(s => s === scheme);
}
export const VARIANT_EFFECT_SOURCE_NAMES = {
    alphamissense: 'AlphaMissense scores',
    clinvar: 'ClinVar variants',
};
/**
 * The mean AlphaMissense pathogenicity of every substitution at each residue,
 * the per-residue figure AlphaFold DB colours its models by. The sequence is
 * spelled from each row's reference residue, `X` where no row names one.
 */
export function meanScoreByPosition(rows) {
    const sums = new Map();
    const residues = [];
    for (const { start, score, ref } of rows) {
        residues[start] = ref;
        const sum = sums.get(start + 1);
        if (sum) {
            sum.total += score;
            sum.count++;
        }
        else {
            sums.set(start + 1, { total: score, count: 1 });
        }
    }
    return {
        sequence: Array.from(residues, r => r ?? 'X').join(''),
        byPosition: new Map([...sums].map(([position, { total, count }]) => [
            position,
            total / count,
        ])),
    };
}
const PATHOGENIC_SIGNIFICANCE = new Set(['Pathogenic', 'Likely pathogenic']);
/**
 * How many distinct missense substitutions ClinVar calls pathogenic or likely
 * pathogenic at each residue of the entry, from the EBI proteins API's
 * variation record. Every residue of the entry gets a count, zero included,
 * so a residue with none is told apart from one the structure cannot place.
 * A substitution reported by several ClinVar records (two codon changes to
 * one amino acid) counts once; a significance only Ensembl or UniProt
 * asserts does not count.
 */
export function pathogenicCountByPosition({ sequence = '', features, }) {
    const substitutions = new Map();
    for (const f of features) {
        if (f.consequenceType === 'missense' &&
            f.clinicalSignificances?.some(c => PATHOGENIC_SIGNIFICANCE.has(c.type) && c.sources?.includes('ClinVar'))) {
            for (let pos = +f.begin; pos <= +f.end; pos++) {
                const seen = substitutions.get(pos) ?? new Set();
                seen.add(`${f.begin}-${f.end}${f.mutatedType ?? ''}`);
                substitutions.set(pos, seen);
            }
        }
    }
    return {
        sequence,
        byPosition: new Map(Array.from(sequence, (_, i) => [
            i + 1,
            substitutions.get(i + 1)?.size ?? 0,
        ])),
    };
}
/**
 * Carries an entry's per-position values onto one entity's residues through
 * `mapUniProtPosition` (see structureUniProt), which places only what it can:
 * a residue the map does not reach gets no value rather than a neighbour's.
 */
export function placeValues(values, mapUniProtPosition, entity) {
    const byLabelSeqId = new Map();
    for (const [position, value] of values.byPosition) {
        const structurePos = mapUniProtPosition(position);
        const labelSeqId = structurePos === undefined ? undefined : entity.seqIds[structurePos];
        if (labelSeqId !== undefined) {
            byLabelSeqId.set(labelSeqId, value);
        }
    }
    return { entityId: entity.entityId, byLabelSeqId };
}
function hexRgb(hex) {
    const n = Number.parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/**
 * AlphaMissense's scale as the 1D protein view's track draws it and AlphaFold
 * DB colours it: likely benign blue, ambiguous white at 0.5, likely
 * pathogenic red.
 */
export const ALPHAMISSENSE_RANGE = ['#2c7bb6', '#ffffff', '#d7191c'];
export const ALPHAMISSENSE_MID = 0.5;
const [BENIGN, AMBIGUOUS, PATHOGENIC] = ALPHAMISSENSE_RANGE.map(hexRgb);
export function alphaMissenseRgb(score) {
    const t = Math.max(0, Math.min(1, score));
    const [from, to, f] = t < ALPHAMISSENSE_MID
        ? [BENIGN, AMBIGUOUS, t / ALPHAMISSENSE_MID]
        : [AMBIGUOUS, PATHOGENIC, (t - ALPHAMISSENSE_MID) / ALPHAMISSENSE_MID];
    const mix = (i) => Math.round(from[i] + (to[i] - from[i]) * f);
    return [mix(0), mix(1), mix(2)];
}
/** ColorBrewer Reds, one step per pathogenic substitution up to four */
export const CLINVAR_COLORS = [
    '#fee5d9',
    '#fcae91',
    '#fb6a4a',
    '#de2d26',
    '#a50f15',
];
export function clinVarRgb(count) {
    const index = Math.max(0, Math.min(CLINVAR_COLORS.length - 1, count));
    return hexRgb(CLINVAR_COLORS[index]);
}
