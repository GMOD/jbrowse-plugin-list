/**
 * UniProt's feature types in its entry page's order (function, topology,
 * processing, PTMs, family, sequence, structure), each with the color the 3D
 * feature bar paints it. The 1D view stacks its sections in this order.
 * Signal, Calcium binding and Nucleotide binding are types older entries
 * still carry.
 */
export const UNIPROT_FEATURE_TYPES = [
  { type: 'Domain', color: '#1f77b4' },
  { type: 'Repeat', color: '#7f7f7f' },
  { type: 'Zinc finger', color: '#d62728' },
  { type: 'DNA binding', color: '#ff7f0e' },
  { type: 'Calcium binding', color: '#fd8d3c' },
  { type: 'Nucleotide binding', color: '#74c476' },
  { type: 'Region', color: '#2ca02c' },
  { type: 'Coiled coil', color: '#9467bd' },
  { type: 'Motif', color: '#8c564b' },
  { type: 'Compositional bias', color: '#e377c2' },
  { type: 'Active site', color: '#f7b6d2' },
  { type: 'Binding site', color: '#c7c7c7' },
  { type: 'Site', color: '#dbdb8d' },
  { type: 'Topological domain', color: '#aec7e8' },
  { type: 'Transmembrane', color: '#bcbd22' },
  { type: 'Intramembrane', color: '#17becf' },
  { type: 'Signal', color: '#ffbb78' },
  { type: 'Signal peptide', color: '#ffbb78' },
  { type: 'Transit peptide', color: '#ff9896' },
  { type: 'Propeptide', color: '#98df8a' },
  { type: 'Peptide', color: '#6baed6' },
  { type: 'Initiator methionine', color: '#ce6dbd' },
  { type: 'Chain', color: '#c5b0d5' },
  { type: 'Modified residue', color: '#9edae5' },
  { type: 'Lipidation', color: '#637939' },
  { type: 'Glycosylation', color: '#393b79' },
  { type: 'Disulfide bond', color: '#c49c94' },
  { type: 'Cross-link', color: '#8c6d31' },
  { type: 'Natural variant', color: '#de9ed6' },
  { type: 'Mutagenesis', color: '#ad494a' },
  { type: 'Alternative sequence', color: '#e7969c' },
  { type: 'Sequence conflict', color: '#b5cf6b' },
  { type: 'Helix', color: '#e7ba52' },
  { type: 'Beta strand', color: '#6b6ecf' },
  { type: 'Turn', color: '#d6616b' },
]

const UNLISTED_COLOR = '#999999'

export function getFeatureColor(type: string) {
  return (
    UNIPROT_FEATURE_TYPES.find(t => t.type === type)?.color ?? UNLISTED_COLOR
  )
}

/** `types` in UniProt's order, any it does not list last and sorted. */
export function inUniProtOrder(types: readonly string[]) {
  const rank = (type: string) => {
    const i = UNIPROT_FEATURE_TYPES.findIndex(t => t.type === type)
    return i === -1 ? UNIPROT_FEATURE_TYPES.length : i
  }
  return types.toSorted((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}
