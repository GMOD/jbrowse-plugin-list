import useSWR from 'swr'

export interface UniProtFeature {
  type: string
  start: number
  end: number
  description: string
  id?: string
  uniqueId: string
}

const featureColors: Record<string, string> = {
  Domain: '#1f77b4',
  'DNA binding': '#ff7f0e',
  Region: '#2ca02c',
  'Zinc finger': '#d62728',
  'Coiled coil': '#9467bd',
  Motif: '#8c564b',
  'Compositional bias': '#e377c2',
  Repeat: '#7f7f7f',
  Transmembrane: '#bcbd22',
  Intramembrane: '#17becf',
  'Topological domain': '#aec7e8',
  Signal: '#ffbb78',
  'Signal peptide': '#ffbb78',
  Propeptide: '#98df8a',
  'Transit peptide': '#ff9896',
  Chain: '#c5b0d5',
  'Disulfide bond': '#c49c94',
  'Active site': '#f7b6d2',
  'Binding site': '#c7c7c7',
  Site: '#dbdb8d',
  'Modified residue': '#9edae5',
  Glycosylation: '#393b79',
  Lipidation: '#637939',
  'Cross-link': '#8c6d31',
  'Alternative sequence': '#e7969c',
  'Natural variant': '#de9ed6',
  Mutagenesis: '#ad494a',
  'Sequence conflict': '#b5cf6b',
  Helix: '#e7ba52',
  'Beta strand': '#6b6ecf',
  Turn: '#d6616b',
  'Initiator methionine': '#ce6dbd',
  Peptide: '#6baed6',
  'Calcium binding': '#fd8d3c',
  'Nucleotide binding': '#74c476',
}

export function getFeatureColor(type: string) {
  return featureColors[type] ?? '#999999'
}

async function fetchUniProtFeatures(url: string): Promise<UniProtFeature[]> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`)
  }
  const text = await res.text()

  const features: UniProtFeature[] = []
  for (const line of text.split('\n')) {
    if (line.startsWith('#') || !line.trim()) {
      continue
    }
    const parts = line.split('\t')
    if (parts.length < 9) {
      continue
    }
    const type = parts[2]
    const start = Number.parseInt(parts[3] ?? '0', 10)
    const end = Number.parseInt(parts[4] ?? '0', 10)
    const attributes = parts[8] ?? ''

    let description = ''
    let id: string | undefined
    for (const attr of attributes.split(';')) {
      const [key, value] = attr.split('=')
      if (key === 'Note') {
        description = decodeURIComponent(value ?? '').replace(/%2C/g, ',')
      } else if (key === 'ID') {
        id = value
      }
    }

    if (type) {
      const uniqueId = `${type}-${start}-${end}-${features.length}`
      features.push({
        type,
        start,
        end,
        description,
        id,
        uniqueId,
      })
    }
  }

  return features
}

export default function useUniProtFeatures(uniprotId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    uniprotId ? `https://rest.uniprot.org/uniprotkb/${uniprotId}.gff` : null,
    fetchUniProtFeatures,
  )

  return {
    features: data,
    error,
    isLoading,
  }
}
