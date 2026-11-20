// @vitest-environment jsdom
import { SimpleFeature } from '@jbrowse/core/util'
import { renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

import useGeneStructures from './useGeneStructures'

import type * as StructureDatasets from '../utils/structureDatasets'
import type { StructureDataset } from '../utils/structureDatasets'
import type * as P2sMapper from 'p2s_mapper'

// each test asks its own accession, and the second its own entry, so SWR's
// shared cache cannot answer one test with another's data
vi.mock('./useIsoformProteinSequences', () => ({
  default: () => ({ isoformSequences: {} }),
}))
function dataset(datasetId: string): StructureDataset {
  return {
    datasetId,
    name: `${datasetId} folds`,
    description: '',
    mappingLocation: {
      locationType: 'UriLocation',
      uri: `https://example.org/${datasetId}/mapping.tsv`,
    },
  }
}

// a config names its datasets; these stand in for the config slot
// and the mapping files it points at
const configDatasets = new WeakMap<object, StructureDataset[]>()
vi.mock('../utils/structureDatasets', async importActual => {
  const actual = await importActual<typeof StructureDatasets>()
  return {
    ...actual,
    readStructureDatasets: (jbrowse: object) =>
      configDatasets.get(jbrowse) ?? [],
    loadStructureMapping: async ({ datasetId }: StructureDataset) => {
      if (datasetId === 'offline') {
        throw new Error('HTTP 404')
      }
      return actual.parseStructureMapping(
        'ENST00000369535.5\tNRAS_rank_1.pdb\tP01111\nENST00000999999.1\tother.pdb\n',
        `https://example.org/${datasetId}/mapping.tsv`,
      )
    },
  }
})

vi.mock('p2s_mapper', async importActual => ({
  ...(await importActual<typeof P2sMapper>()),
  fetchAlphaFoldModels: async (accession: string) => [
    {
      accession,
      url: `https://alphafold.ebi.ac.uk/files/AF-${accession}-F1-model_v6.cif`,
      sequence: 'M'.repeat(189),
    },
  ],
  fetchAlphaFoldComplexes: async (accession: string) => {
    if (accession === 'P00004') {
      throw new Error('AlphaFold DB did not answer')
    }
    return []
  },
  fetchExperimentalStructures: async (accession: string) => {
    if (accession === 'P00003') {
      throw new Error('HTTP 503 from sequence-coordinates.rcsb.org')
    }
    return [
      {
        pdbId: accession === 'P00002' ? '8bad' : '9btm',
        method: 'X-ray',
        resolution: 2,
        start: 1,
        end: 169,
        coverage: 0.89,
        chains: ['A'],
      },
    ]
  },
  fetchPdbEntrySummaries: async (ids: string[]) => {
    if (ids.includes('8bad')) {
      throw new Error('HTTP 503 from data.rcsb.org')
    }
    return new Map([
      [
        '9btm',
        {
          pdbId: '9btm',
          title: 'NRas 1-169 Q61R in Complex with Shoc2 80-582',
          polymers: [
            {
              entityId: '9BTM_1',
              description: 'SHOC-2',
              type: 'Protein',
              uniprotIds: ['Q9UQ13'],
              chains: ['B'],
            },
          ],
          ligands: [],
        },
      ],
    ])
  },
}))

const feature = new SimpleFeature({
  uniqueId: 'f',
  refName: 'chr1',
  start: 0,
  end: 10,
})

const nras = new SimpleFeature({
  uniqueId: 'nras',
  type: 'gene',
  refName: 'chr1',
  start: 0,
  end: 600,
  gene_name: 'NRAS',
  subfeatures: [
    {
      uniqueId: 'nras-201',
      type: 'transcript',
      refName: 'chr1',
      start: 0,
      end: 600,
      id: 'ENST00000369535.5',
      subfeatures: [
        {
          uniqueId: 'nras-201-cds',
          type: 'CDS',
          refName: 'chr1',
          start: 0,
          end: 570,
        },
      ],
    },
  ],
})

function configWith(datasets: StructureDataset[]) {
  const jbrowse = {}
  configDatasets.set(jbrowse, datasets)
  return jbrowse
}

function render(uniprotId: string) {
  return renderHook(() =>
    useGeneStructures({
      jbrowse: configWith([]),
      uniprotId,
      uniprotPending: false,
      geneName: 'NRAS',
      feature,
    }),
  )
}

test('lists the model, then an entry once RCSB has named its partners', async () => {
  const { result } = render('P00001')
  await waitFor(() => {
    expect(result.current.rows.map(r => [r.key, r.section])).toEqual([
      ['alphafold', 'alone'],
      ['pdb:9btm', 'partner'],
    ])
  })
  expect(result.current.uniprotLength).toBe(189)
  expect(result.current.defaultSettled).toBe(true)
  expect(result.current.sections.partner).toEqual({
    loading: [],
    notices: [],
  })
})

test('a failed partner lookup places entries by coverage and says so', async () => {
  const { result } = render('P00002')
  await waitFor(() => {
    expect(result.current.rows.map(r => [r.key, r.section])).toEqual([
      ['alphafold', 'alone'],
      ['pdb:8bad', 'alone'],
    ])
  })
  expect(result.current.sections.alone.notices).toEqual([
    expect.stringMatching(/^RCSB did not describe the PDB entries.*503/),
  ])
  expect(result.current.sections.fragment.notices).toEqual([])
})

test('RCSB failing leaves the AlphaFold model listed and a line in each section', async () => {
  const { result } = render('P00003')
  await waitFor(() => {
    expect(result.current.sections.fragment.notices).toEqual([
      expect.stringMatching(/^RCSB did not list the PDB entries/),
    ])
  })
  expect(result.current.rows.map(r => r.key)).toEqual(['alphafold'])
  expect(result.current.sections.alone.notices).toHaveLength(1)
  expect(result.current.sections.partner.notices).toHaveLength(1)
})

test('the complex list failing costs only its own section a line', async () => {
  const { result } = render('P00004')
  await waitFor(() => {
    expect(result.current.sections.partner.notices).toEqual([
      expect.stringMatching(/complex list did not answer/),
    ])
  })
  await waitFor(() => {
    expect(result.current.rows.map(r => r.key)).toEqual([
      'alphafold',
      'pdb:9btm',
    ])
  })
  expect(result.current.sections.alone.notices).toEqual([])
})

test("a site's dataset leads the list and settles the default without UniProt", async () => {
  const jbrowse = configWith([dataset('colabfold')])
  const { result } = renderHook(() =>
    useGeneStructures({
      jbrowse,
      uniprotPending: true,
      geneName: 'NRAS',
      feature: nras,
    }),
  )
  await waitFor(() => {
    expect(result.current.defaultSettled).toBe(true)
  })
  expect(result.current.rows.map(r => [r.key, r.section, r.title])).toEqual([
    [
      'dataset:colabfold:ENST00000369535.5:NRAS_rank_1.pdb',
      'alone',
      'colabfold folds model of transcript ENST00000369535.5',
    ],
  ])
})

test('a dataset that fails to load costs a line, not the list', async () => {
  const jbrowse = configWith([dataset('offline'), dataset('colabfold')])
  const { result } = renderHook(() =>
    useGeneStructures({
      jbrowse,
      uniprotId: 'P00005',
      uniprotPending: false,
      geneName: 'NRAS',
      feature: nras,
    }),
  )
  await waitFor(() => {
    expect(result.current.sections.alone.notices).toEqual([
      "offline folds's structure list did not load: HTTP 404",
    ])
  })
  await waitFor(() => {
    expect(result.current.rows.map(r => r.key)).toEqual([
      'dataset:colabfold:ENST00000369535.5:NRAS_rank_1.pdb',
      'alphafold',
      'pdb:9btm',
    ])
  })
})
