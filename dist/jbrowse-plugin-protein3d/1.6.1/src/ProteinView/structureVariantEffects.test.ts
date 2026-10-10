import { types } from '@jbrowse/mobx-state-tree'
import { beforeEach, expect, test, vi } from 'vitest'

import Structure from './structureModel'

import type { ProteinColorScheme } from './applyColorTheme'
import type * as JBrowseCoreUtil from '@jbrowse/core/util'
import type { SimpleFeatureSerialized } from '@jbrowse/core/util'
import type { AlignmentAlgorithm, PairwiseAlignment } from 'p2s_mapper'

const testSession = vi.hoisted(() => ({
  views: new Array<{ id: string; type: string; assemblyNames: string[] }>(),
}))

vi.mock('@jbrowse/core/util', async importActual => {
  const actual = await importActual<typeof JBrowseCoreUtil>()
  const { localRpcManager } = await import('../test_data/localRpcManager')
  const rpcManager = localRpcManager()
  return {
    ...actual,
    getSession: () => ({
      rpcManager,
      hovered: undefined,
      views: testSession.views,
      assemblyManager: {
        get: (name: string) =>
          name === 'hg38' ? { name, aliases: ['GRCh38'] } : undefined,
      },
    }),
  }
})

// transcript residue -> pathogenic substitutions, as the VCF would give them
vi.mock('./clinVarSource', () => ({
  fetchClinVarCounts: vi.fn(
    async () =>
      new Map([
        [0, 1],
        [1, 0],
        [2, 3],
        [3, 2],
        [4, 0],
      ]),
  ),
}))

const responses: Record<string, string> = {
  'https://alphafold.ebi.ac.uk/files/AF-P0AF01-F1-aa-substitutions.csv': [
    'protein_variant,am_pathogenicity,am_class',
    'M1A,0.2,LBen',
    'M1C,0.4,Amb',
    'K2E,0.1,LBen',
    'V3E,0.9,LPath',
    'A4G,0.5,Amb',
  ].join('\n'),
  // numbered on a revision of the entry one residue longer than the model
  'https://alphafold.ebi.ac.uk/files/AF-P0OLD1-F1-aa-substitutions.csv': [
    'protein_variant,am_pathogenicity,am_class',
    'M1A,0.2,LBen',
    'K2E,0.1,LBen',
    'V3E,0.9,LPath',
    'A4G,0.5,Amb',
    'L5P,0.5,Amb',
  ].join('\n'),
  'https://alphafold.ebi.ac.uk/files/AF-P0PDB1-F1-aa-substitutions.csv': [
    'protein_variant,am_pathogenicity,am_class',
    'L10P,0.3,LBen',
    'M11P,0.8,LPath',
    'N12P,0.6,Amb',
  ].join('\n'),
}

// SIFTS never answers here; each test hands the structure its mapping
beforeEach(() => {
  testSession.views = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      url.includes('ebi.ac.uk/pdbe')
        ? new Promise<Response>(() => {})
        : url in responses
          ? new Response(responses[url])
          : new Response('', { status: 404 }),
    ),
  )
})

const TestParent = types
  .model({ structures: types.array(Structure) })
  .volatile((): { colorScheme: ProteinColorScheme } => ({
    colorScheme: 'default',
  }))
  .views(() => ({
    get alignmentAlgorithm(): AlignmentAlgorithm {
      return 'needleman_wunsch'
    },
    get molstarPluginContext() {
      return undefined
    },
  }))
  .actions(self => ({
    setColorScheme(scheme: ProteinColorScheme) {
      self.colorScheme = scheme
    },
    setError(e: unknown) {
      throw e
    },
  }))

function loaded(
  snapshot: {
    uniprotId?: string
    pdbId?: string
    url?: string
    connectedViewId?: string
    feature?: SimpleFeatureSerialized
    pairwiseAlignment?: PairwiseAlignment
  },
  colorScheme: ProteinColorScheme,
  entity: { entityId: string; seq: string },
) {
  const parent = TestParent.create({ structures: [snapshot] })
  parent.setColorScheme(colorScheme)
  const structure = parent.structures[0]!
  structure.setStructureData({
    entities: [
      {
        ...entity,
        seqIds: Array.from(entity.seq, (_, i) => i + 1),
        chains: ['A'],
      },
    ],
  })
  structure.setLoadedToMolstar(true)
  return { parent, structure }
}

test("an AlphaFold model takes the entry's values one to one", async () => {
  const { structure } = loaded({ uniprotId: 'P0AF01' }, 'alphamissense', {
    entityId: '1',
    seq: 'MKVA',
  })
  // colour arriving later only recolours, so nothing else waits on it
  expect(structure.loading).toBe(false)
  expect(structure.variantEffectsPending).toBe(true)
  await vi.waitFor(() => {
    expect(structure.variantEffectsPending).toBe(false)
  })
  expect(structure.placedVariantEffects?.entityId).toBe('1')
  const placed = [...(structure.placedVariantEffects?.byLabelSeqId ?? [])]
  expect(placed.map(([id]) => id)).toEqual([1, 2, 3, 4])
  expect(placed[0]?.[1]).toBeCloseTo(0.3)
  expect(placed[2]?.[1]).toBeCloseTo(0.9)
  expect(structure.statusMessage).toBeUndefined()
})

test('a PDB entry takes them through SIFTS, on the mapped entity only', async () => {
  const { structure } = loaded({ pdbId: '9XYZ' }, 'alphamissense', {
    entityId: '2',
    seq: 'GLMN',
  })
  expect(structure.loadingMessage).toBe('Mapping 9XYZ to UniProt')
  structure.setUniProtMappings([
    {
      accession: 'P0PDB1',
      segments: [
        {
          entityId: '2',
          unpStart: 10,
          unpEnd: 12,
          structStart: 1,
          structEnd: 3,
        },
      ],
    },
  ])
  await vi.waitFor(() => {
    expect(structure.variantEffectsPending).toBe(false)
  })
  // the construct's first residue, a tag, has no UniProt position
  expect(structure.placedVariantEffects).toEqual({
    entityId: '2',
    byLabelSeqId: new Map([
      [2, 0.3],
      [3, 0.8],
      [4, 0.6],
    ]),
  })
})

test('a source that fails says so beside the structure, and is asked again once the scheme is chosen again', async () => {
  const url =
    'https://alphafold.ebi.ac.uk/files/AF-P0LATE-F1-aa-substitutions.csv'
  const { parent, structure } = loaded(
    { uniprotId: 'P0LATE' },
    'alphamissense',
    { entityId: '1', seq: 'M' },
  )
  await vi.waitFor(() => {
    expect(structure.variantEffectsPending).toBe(false)
  })
  expect(structure.statusMessage).toBe(
    'Could not fetch AlphaMissense scores for P0LATE: HTTP 404',
  )
  expect(structure.error).toBeUndefined()
  expect(structure.placedVariantEffects).toBeUndefined()
  const asked = () => vi.mocked(fetch).mock.calls.filter(([u]) => u === url)
  // recording the failure does not set off a retry loop
  await new Promise(resolve => setTimeout(resolve, 10))
  expect(asked()).toHaveLength(1)

  responses[url] = 'protein_variant,am_pathogenicity,am_class\nM1A,0.7,LPath'
  parent.setColorScheme('default')
  parent.setColorScheme('alphamissense')
  await vi.waitFor(() => {
    expect(structure.placedVariantEffects?.byLabelSeqId.get(1)).toBe(0.7)
  })
  expect(asked()).toHaveLength(2)
  expect(structure.statusMessage).toBeUndefined()
})

test('a model folded from another revision of the entry stays grey', async () => {
  const { structure } = loaded({ uniprotId: 'P0OLD1' }, 'alphamissense', {
    entityId: '1',
    seq: 'MKVA',
  })
  await vi.waitFor(() => {
    expect(structure.variantEffectsPending).toBe(false)
  })
  expect(structure.placedVariantEffects).toBeUndefined()
  expect(structure.statusMessage).toBe(
    "AlphaMissense scores for P0OLD1 number a sequence that differs from this model's",
  )
})

test('a structure with no UniProt entry asks nothing and says why', () => {
  const { parent, structure } = loaded({ url: 'x.cif' }, 'alphamissense', {
    entityId: '1',
    seq: 'MKVA',
  })
  expect(structure.loading).toBe(false)
  expect(structure.statusMessage).toBe(
    'No UniProt entry to place AlphaMissense scores on',
  )
  parent.setColorScheme('chain-id')
  expect(structure.statusMessage).toBeUndefined()
  expect(fetch).not.toHaveBeenCalled()
})

const transcript: SimpleFeatureSerialized = {
  uniqueId: 'tx1',
  refName: 'chr17',
  start: 0,
  end: 15,
  strand: 1,
  type: 'mRNA',
  name: 'NM_TEST.1',
  subfeatures: [
    { uniqueId: 'cds1', refName: 'chr17', start: 0, end: 15, type: 'CDS' },
  ],
}

test("ClinVar lands on a crystal through its alignment to the transcript, not UniProt's numbering", async () => {
  testSession.views = [
    { id: 'lgv', type: 'LinearGenomeView', assemblyNames: ['hg38'] },
  ]
  const { structure } = loaded(
    {
      pdbId: '9XYZ',
      connectedViewId: 'lgv',
      feature: transcript,
      // the crystal lacks the transcript's third residue and adds a tag
      pairwiseAlignment: {
        consensus: ' || ||',
        alns: [
          { id: 'transcript', seq: '-MKVAL' },
          { id: 'structure', seq: 'GMK-AL' },
        ],
      },
    },
    'clinvar',
    { entityId: '2', seq: 'GMKAL' },
  )
  // SIFTS never answers, and ClinVar does not wait for it
  expect(structure.uniProtEntry.isLoading).toBe(true)
  await vi.waitFor(() => {
    expect(structure.variantEffectsPending).toBe(false)
  })
  expect(structure.placedVariantEffects).toEqual({
    entityId: '2',
    byLabelSeqId: new Map([
      [2, 1],
      [3, 0],
      [4, 2],
      [5, 0],
    ]),
  })
  const { fetchClinVarCounts } = await import('./clinVarSource')
  expect(fetchClinVarCounts).toHaveBeenCalledWith(
    expect.objectContaining({ build: 'GRCh38', assemblyName: 'hg38' }),
  )
  expect(structure.statusMessage).toBeUndefined()
})

test('ClinVar on a structure with no transcript says why', () => {
  const { structure } = loaded({ uniprotId: 'P0AF01' }, 'clinvar', {
    entityId: '1',
    seq: 'MKVA',
  })
  expect(structure.variantEffectsPending).toBe(false)
  expect(structure.statusMessage).toBe(
    'No transcript to place ClinVar variants on',
  )
  expect(fetch).not.toHaveBeenCalled()
})
