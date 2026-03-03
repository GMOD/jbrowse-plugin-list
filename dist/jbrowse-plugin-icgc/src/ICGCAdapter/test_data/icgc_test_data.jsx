const icgcFilters = {
  mutation: { location: { is: 'chr3:124895380-124923310' } },
  donor: { relapseType: { is: ['distant recurrence/metastasis'] } },
}

const icgcResponse = {
  hits: [
    {
      id: 'MU89172348',
      type: 'insertion of <=200bp',
      chromosome: '3',
      start: 124921497,
      end: 124921497,
      mutation: '->AAAAAAA',
      assemblyVersion: 'GRCh37',
      referenceGenomeAllele: '-',
      testedDonorCount: 67,
      affectedDonorCountTotal: 6,
      affectedDonorCountFiltered: 2,
      affectedProjectCount: 1,
      transcripts: [
        {
          id: 'ENST00000314584',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000393469',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000423114',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000469902',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000481760',
          consequence: {
            type: 'downstream_gene_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
      ],
      functionalImpact: ['Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown'],
      study: [],
    },
    {
      id: 'MU30653737',
      type: 'single base substitution',
      chromosome: '3',
      start: 124918162,
      end: 124918162,
      mutation: 'C>T',
      assemblyVersion: 'GRCh37',
      referenceGenomeAllele: 'C',
      testedDonorCount: 137,
      affectedDonorCountTotal: 2,
      affectedDonorCountFiltered: 2,
      affectedProjectCount: 2,
      transcripts: [
        {
          id: 'ENST00000314584',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000393469',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000423114',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000469902',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
      ],
      functionalImpact: ['Unknown', 'Unknown', 'Unknown', 'Unknown'],
      study: ['PCAWG'],
    },
    {
      id: 'MU30416030',
      type: 'single base substitution',
      chromosome: '3',
      start: 124897024,
      end: 124897024,
      mutation: 'A>T',
      assemblyVersion: 'GRCh37',
      referenceGenomeAllele: 'A',
      testedDonorCount: 140,
      affectedDonorCountTotal: 1,
      affectedDonorCountFiltered: 1,
      affectedProjectCount: 1,
      transcripts: [
        {
          id: 'ENST00000314584',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000393469',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000423114',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000462437',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000469902',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000473262',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000479826',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
      ],
      functionalImpact: [
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
      ],
      study: [],
    },
    {
      id: 'MU119005643',
      type: 'single base substitution',
      chromosome: '3',
      start: 124910384,
      end: 124910384,
      mutation: 'G>A',
      assemblyVersion: 'GRCh37',
      referenceGenomeAllele: 'G',
      testedDonorCount: 100,
      affectedDonorCountTotal: 1,
      affectedDonorCountFiltered: 1,
      affectedProjectCount: 1,
      transcripts: [
        {
          id: 'ENST00000314584',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000393469',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000423114',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000462437',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000469902',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000473262',
          consequence: {
            type: 'upstream_gene_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000479826',
          consequence: {
            type: 'upstream_gene_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
      ],
      functionalImpact: [
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
      ],
      study: [],
    },
    {
      id: 'MU75315421',
      type: 'single base substitution',
      chromosome: '3',
      start: 124900308,
      end: 124900308,
      mutation: 'G>A',
      assemblyVersion: 'GRCh37',
      referenceGenomeAllele: 'G',
      testedDonorCount: 409,
      affectedDonorCountTotal: 1,
      affectedDonorCountFiltered: 1,
      affectedProjectCount: 1,
      transcripts: [
        {
          id: 'ENST00000314584',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000393469',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000423114',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000462437',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000469902',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000473262',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000479826',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
      ],
      functionalImpact: [
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
      ],
      study: ['PCAWG'],
    },
    {
      id: 'MU39656553',
      type: 'single base substitution',
      chromosome: '3',
      start: 124916427,
      end: 124916427,
      mutation: 'C>T',
      assemblyVersion: 'GRCh37',
      referenceGenomeAllele: 'C',
      testedDonorCount: 100,
      affectedDonorCountTotal: 1,
      affectedDonorCountFiltered: 1,
      affectedProjectCount: 1,
      transcripts: [
        {
          id: 'ENST00000314584',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000393469',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000423114',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000462437',
          consequence: {
            type: 'upstream_gene_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000469902',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
      ],
      functionalImpact: ['Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown'],
      study: [],
    },
    {
      id: 'MU125557849',
      type: 'single base substitution',
      chromosome: '3',
      start: 124907170,
      end: 124907170,
      mutation: 'G>T',
      assemblyVersion: 'GRCh37',
      referenceGenomeAllele: 'G',
      testedDonorCount: 186,
      affectedDonorCountTotal: 1,
      affectedDonorCountFiltered: 1,
      affectedProjectCount: 1,
      transcripts: [
        {
          id: 'ENST00000314584',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000393469',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000423114',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000462437',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000469902',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000473262',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000479826',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
      ],
      functionalImpact: [
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
      ],
      study: [],
    },
    {
      id: 'MU114819858',
      type: 'deletion of <=200bp',
      chromosome: '3',
      start: 124900868,
      end: 124900868,
      mutation: 'A>-',
      assemblyVersion: 'GRCh37',
      referenceGenomeAllele: 'A',
      testedDonorCount: 268,
      affectedDonorCountTotal: 1,
      affectedDonorCountFiltered: 1,
      affectedProjectCount: 1,
      transcripts: [
        {
          id: 'ENST00000314584',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000393469',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000423114',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000462437',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000469902',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000473262',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000479826',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
      ],
      functionalImpact: [
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
      ],
      study: [],
    },
    {
      id: 'MU125597863',
      type: 'single base substitution',
      chromosome: '3',
      start: 124906705,
      end: 124906705,
      mutation: 'G>T',
      assemblyVersion: 'GRCh37',
      referenceGenomeAllele: 'G',
      testedDonorCount: 186,
      affectedDonorCountTotal: 1,
      affectedDonorCountFiltered: 1,
      affectedProjectCount: 1,
      transcripts: [
        {
          id: 'ENST00000314584',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000393469',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000423114',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000462437',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000469902',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000473262',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000479826',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
      ],
      functionalImpact: [
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
      ],
      study: [],
    },
    {
      id: 'MU75489227',
      type: 'deletion of <=200bp',
      chromosome: '3',
      start: 124912214,
      end: 124912214,
      mutation: 'A>-',
      assemblyVersion: 'GRCh37',
      referenceGenomeAllele: 'A',
      testedDonorCount: 627,
      affectedDonorCountTotal: 3,
      affectedDonorCountFiltered: 1,
      affectedProjectCount: 2,
      transcripts: [
        {
          id: 'ENST00000314584',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000393469',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000423114',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000462437',
          consequence: {
            type: 'upstream_gene_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000469902',
          consequence: {
            type: 'intron_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000473262',
          consequence: {
            type: 'upstream_gene_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
        {
          id: 'ENST00000479826',
          consequence: {
            type: 'upstream_gene_variant',
            functionalImpact: 'Unknown',
          },
          functionalImpact: 'Unknown',
        },
      ],
      functionalImpact: [
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
      ],
      study: [],
    },
  ],
  facets: {},
  pagination: {
    count: 10,
    total: 73,
    page: 1,
    pages: 8,
    order: 'desc',
    sort: 'affectedDonorCountFiltered',
    from: 1,
    size: 10,
  },
}

export { icgcFilters, icgcResponse }
