import { describe, expect, it, vi } from 'vitest'

import { resolveDatasetStructures } from './datasetLaunch'

import type * as StructureDatasets from '../LaunchProteinView/utils/structureDatasets'
import type { StructureDataset } from '../LaunchProteinView/utils/structureDatasets'

const COLABFOLD: StructureDataset = {
  datasetId: 'colabfold',
  name: 'ColabFold',
  description: '',
  mappingLocation: {
    locationType: 'UriLocation',
    uri: 'https://example.org/folds/mapping.tsv',
  },
}

const loads = vi.fn<(dataset: StructureDataset) => void>()

vi.mock('../LaunchProteinView/utils/structureDatasets', async importActual => {
  const actual = await importActual<typeof StructureDatasets>()
  return {
    ...actual,
    readStructureDatasets: () => [COLABFOLD],
    loadStructureMapping: async (dataset: StructureDataset) => {
      loads(dataset)
      return actual.parseStructureMapping(
        [
          'ENST00000369535.5\tNRAS.pdb\tP01111',
          'KRAS\thttps://cdn.example.org/KRAS.cif',
        ].join('\n'),
        'https://example.org/folds/mapping.tsv',
      )
    },
  }
})

const session = { jbrowse: {} }

describe('resolveDatasetStructures', () => {
  it('hands a launch naming no dataset back as it came, reading nothing', async () => {
    const launch = { uniprotId: 'P01111', transcriptId: 'ENST00000369535' }
    expect(await resolveDatasetStructures(session, launch)).toBe(launch)
    expect(loads).not.toHaveBeenCalled()
  })

  it("swaps datasetId for the url and accession listed under the launch's transcript", async () => {
    expect(
      await resolveDatasetStructures(session, {
        datasetId: 'colabfold',
        transcriptId: 'ENST00000369535',
        connectedView: { assembly: 'hg38', loc: 'chr1:1-100' },
      }),
    ).toEqual({
      url: 'https://example.org/folds/NRAS.pdb',
      uniprotId: 'P01111',
      transcriptId: 'ENST00000369535',
      connectedView: { assembly: 'hg38', loc: 'chr1:1-100' },
    })
  })

  it('reads an entry of structures by the gene when no transcript is named', async () => {
    expect(
      await resolveDatasetStructures(session, {
        gene: 'KRAS',
        structures: [{ datasetId: 'colabfold' }, { uniprotId: 'P01116' }],
      }),
    ).toEqual({
      gene: 'KRAS',
      structures: [
        { url: 'https://cdn.example.org/KRAS.cif', uniprotId: undefined },
        { uniprotId: 'P01116' },
      ],
    })
  })

  it('names what it could not find', async () => {
    await expect(
      resolveDatasetStructures(session, {
        datasetId: 'esmfold',
        transcriptId: 'ENST00000369535',
      }),
    ).rejects.toThrow(/"esmfold" names no dataset.*\(colabfold\)/)
    await expect(
      resolveDatasetStructures(session, {
        datasetId: 'colabfold',
        transcriptId: 'NM_000546.6',
        gene: 'TP53',
      }),
    ).rejects.toThrow('ColabFold lists no structure under NM_000546.6 or TP53')
    await expect(
      resolveDatasetStructures(session, {
        structures: [{ datasetId: 'colabfold' }],
      }),
    ).rejects.toThrow(/^structures\[0\]\.datasetId .* names neither/)
  })
})
