/**
 * The color object of each per-residue field, keyed by the field. The 3D
 * themes, their legends, the alignment's residue rows and the 1D protein
 * view's tracks all paint through these.
 */
export const RESIDUE_COLORS = {
    /**
     * AlphaFold's confidence bands, as Mol*'s plddt-confidence theme paints
     * them. Mol* paints the 3D view itself, and puts a score on a cut in the
     * band below where this object puts it above, so an integer score of 50, 70
     * or 90 takes neighboring bands in 3D and in the rows.
     */
    plddt: {
        field: 'plddt',
        scale: 'threshold',
        domain: [50, 70, 90],
        range: ['#ff7d45', '#ffdb13', '#65cbf3', '#0053d6'],
        labels: ['very low <50', 'low 50-70', 'confident 70-90', 'very high >90'],
        title: 'AlphaFold per-residue confidence (pLDDT)',
    },
    /** Kyte-Doolittle hydropathy, isoleucine 4.5 to arginine -4.5. */
    hydrophobicity: {
        field: 'hydrophobicity',
        scale: 'linear',
        domainMin: -4.5,
        domainMax: 4.5,
        domainMid: 0,
        range: ['#3366cc', '#f7f7f7', '#e68c28'],
        labels: ['Hydrophilic', 'Hydrophobic'],
        title: 'Kyte-Doolittle hydrophobicity',
    },
    /**
     * The mean AlphaMissense pathogenicity of every substitution at a residue,
     * as AlphaFold DB colors it.
     */
    alphaMissense: {
        field: 'alphaMissense',
        scale: 'linear',
        domainMin: 0,
        domainMax: 1,
        domainMid: 0.5,
        range: ['#2c7bb6', '#ffffff', '#d7191c'],
        labels: ['Likely benign 0', 'Likely pathogenic 1'],
        title: 'AlphaMissense pathogenicity',
    },
    /**
     * How many missense substitutions at a residue ClinVar calls pathogenic or
     * likely pathogenic: ColorBrewer Reds, one step each up to four.
     */
    clinvarPathogenicCount: {
        field: 'clinvarPathogenicCount',
        scale: 'threshold',
        domain: [1, 2, 3, 4],
        range: ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'],
        labels: ['0', '1', '2', '3', '4 or more'],
        title: 'ClinVar pathogenic variants',
    },
    /**
     * Scores a genome track gives a residue's codon. The domain is a
     * placeholder: the view fills any end the session leaves out from the
     * scores themselves (see valueScale).
     */
    track: {
        field: 'track',
        scale: 'linear',
        domainMin: 0,
        domainMax: 1,
        range: ['#ffffd9', '#41b6c4', '#0c2c84'],
        title: 'Genome track',
    },
    /** Numbers a session gives per residue; the domain follows the numbers. */
    values: {
        field: 'values',
        scale: 'linear',
        domainMin: 0,
        domainMax: 1,
        range: ['#ffffd9', '#41b6c4', '#0c2c84'],
        title: 'Residue values',
    },
};
