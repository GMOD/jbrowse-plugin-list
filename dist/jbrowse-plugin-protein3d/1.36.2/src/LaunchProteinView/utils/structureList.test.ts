import { describe, expect, it } from 'vitest'

import {
  addPdbId,
  addedRows,
  checkedKeys,
  defaultChecked,
  firstRowsAndChecked,
  ligandTags,
  listOrder,
  matchesFilter,
  partnerTags,
  sentenceCase,
  splitChecked,
  structureRows,
  toggleStructure,
} from './structureList'

import type { AddedEntry } from './structureList'
import type {
  AlphaFoldComplex,
  ExperimentalStructure,
  PdbEntrySummary,
} from 'p2s_mapper'

// NRAS (P01111, 189 residues) as RCSB and AlphaFold DB described it on
// 2026-11-05, abridged
const NRAS = 'P01111'

function entry(
  pdbId: string,
  start: number,
  end: number,
  resolution = 1.5,
): ExperimentalStructure {
  return {
    pdbId,
    method: 'X-ray',
    resolution,
    start,
    end,
    coverage: (end - start + 1) / 189,
    chains: ['A'],
  }
}

const ENTRIES = [
  entry('6zio', 1, 172, 1.55),
  entry('9btm', 1, 169, 2.0),
  entry('3con', 1, 172, 1.65),
  entry('7ow4', 6, 15, 1.9),
]

const SUMMARIES = new Map<string, PdbEntrySummary>([
  [
    '6zio',
    {
      pdbId: '6zio',
      title: 'CRYSTAL STRUCTURE OF NRAS (C118S) IN COMPLEX WITH GDP',
      polymers: [
        {
          entityId: '6ZIO_1',
          description: 'GTPase NRas',
          type: 'Protein',
          uniprotIds: [NRAS],
          chains: ['A', 'B'],
        },
      ],
      ligands: [
        { id: 'GDP', name: "GUANOSINE-5'-DIPHOSPHATE" },
        { id: 'MG', name: 'MAGNESIUM ION' },
        { id: 'CIT', name: 'CITRIC ACID' },
      ],
    },
  ],
  [
    '9btm',
    {
      pdbId: '9btm',
      title: 'NRas 1-169 Q61R in Complex with Shoc2 80-582',
      polymers: [
        {
          entityId: '9BTM_2',
          description: 'GTPase NRas',
          type: 'Protein',
          uniprotIds: [NRAS],
          chains: ['A'],
        },
        {
          entityId: '9BTM_1',
          description: 'Leucine-rich repeat protein SHOC-2',
          type: 'Protein',
          uniprotIds: ['Q9UQ13'],
          chains: ['B'],
        },
      ],
      ligands: [{ id: 'GTP', name: "GUANOSINE-5'-TRIPHOSPHATE" }],
    },
  ],
  [
    '7ow4',
    {
      pdbId: '7ow4',
      title:
        'Crystal structure of HLA-A*11:01 in complex with KRAS G12D peptide (VVVGADGVGK)',
      polymers: [
        {
          entityId: '7OW4_3',
          description: 'KRAS G12D peptide',
          type: 'Protein',
          uniprotIds: [NRAS],
          chains: ['C'],
        },
        {
          entityId: '7OW4_1',
          description: 'MHC class I antigen',
          type: 'Protein',
          uniprotIds: ['P04439'],
          chains: ['A'],
        },
      ],
      ligands: [],
    },
  ],
])

const COMPLEXES: AlphaFoldComplex[] = [
  {
    entity: 'AF-0000000210513113',
    homomer: false,
    oligomericState: 'dimer',
    members: [
      { accession: NRAS, gene: 'NRAS', copies: 1 },
      {
        accession: 'Q9UJF2',
        gene: 'RASAL1',
        description: 'RasGAP-activating-like protein 1',
        copies: 1,
      },
    ],
    meanPlddt: 85.71,
    iptm: 0.87,
  },
]

const ALPHAFOLD = {
  accession: NRAS,
  url: 'https://alphafold.ebi.ac.uk/files/AF-P01111-F1-model_v6.cif',
  sequence: 'M'.repeat(189),
  meanPlddt: 92.06,
}

function nrasRows() {
  return structureRows({
    geneName: 'NRAS',
    uniprotId: NRAS,
    uniprotLength: 189,
    alphaFold: ALPHAFOLD,
    entries: ENTRIES,
    summaries: SUMMARIES,
    complexes: COMPLEXES,
  })
}

describe('sentenceCase', () => {
  it('lower-cases a title deposited in capitals, keeping ids, the gene and ligands', () => {
    expect(
      sentenceCase('CRYSTAL STRUCTURE OF NRAS (C118S) IN COMPLEX WITH GDP', [
        'NRAS',
        'GDP',
      ]),
    ).toBe('Crystal structure of NRAS (C118S) in complex with GDP')
    expect(sentenceCase('TUMOR SUPPRESSOR P53 COMPLEXED WITH DNA')).toBe(
      'Tumor suppressor P53 complexed with DNA',
    )
    expect(sentenceCase('HLA-A*11:01 BOUND TO A FAB')).toBe(
      'HLA-A*11:01 bound to a Fab',
    )
  })

  it('starts each sentence of a capitalised title with a capital', () => {
    expect(
      sentenceCase('STRUCTURE AT ATOMIC RESOLUTION. PENTAGON RINGS OF WATER'),
    ).toBe('Structure at atomic resolution. Pentagon rings of water')
    expect(
      sentenceCase('PHOTOSYSTEM I FROM SYNECHOCYSTIS SP. PCC 6803', ['I']),
    ).toBe('Photosystem I from synechocystis sp. pcc 6803')
    expect(sentenceCase('IN VITRO VS. IN VIVO')).toBe('In vitro vs. in vivo')
    expect(sentenceCase('LYSOZYME FROM E. COLI')).toBe('Lysozyme from e. coli')
  })

  it("leaves the depositors' own mixed case alone", () => {
    expect(sentenceCase('NRas 1-169 Q61R in Complex with Shoc2 80-582')).toBe(
      'NRas 1-169 Q61R in Complex with Shoc2 80-582',
    )
  })
})

describe('tags', () => {
  it('names nucleotides and ions, and drops what the crystal was grown in', () => {
    expect(ligandTags(SUMMARIES.get('6zio')!)).toEqual([
      { label: 'GDP', title: "GUANOSINE-5'-DIPHOSPHATE" },
      { label: 'Mg²⁺', title: 'MAGNESIUM ION' },
    ])
  })

  it('keeps a drug as its component id, its full name in the title', () => {
    expect(
      ligandTags({
        pdbId: 'x',
        polymers: [],
        ligands: [{ id: 'EZZ', name: '(3~{S})-3-[2-[(dimethylamino)…' }],
      }),
    ).toEqual([{ label: 'EZZ', title: '(3~{S})-3-[2-[(dimethylamino)…' }])
  })

  it('lists partner proteins by name and nucleic acids by kind', () => {
    const { tags, withProtein } = partnerTags(
      {
        pdbId: '1tup',
        polymers: [
          {
            entityId: '1TUP_1',
            description: 'DNA strand 1',
            type: 'DNA',
            uniprotIds: [],
            chains: ['E'],
          },
          {
            entityId: '1TUP_2',
            description: 'DNA strand 2',
            type: 'DNA',
            uniprotIds: [],
            chains: ['F'],
          },
          {
            entityId: '1TUP_3',
            description: 'P53',
            type: 'Protein',
            uniprotIds: ['P04637'],
            chains: ['A'],
          },
        ],
        ligands: [],
      },
      'P04637',
    )
    expect(withProtein).toBe(false)
    expect(tags).toEqual([
      { label: 'DNA', title: 'DNA strand 1\nDNA strand 2' },
    ])
  })
})

describe('structureRows', () => {
  it('groups by what the structure shows, the AlphaFold model first', () => {
    const rows = listOrder(nrasRows())
    expect(rows.map(r => [r.key, r.section])).toEqual([
      ['alphafold', 'alone'],
      ['pdb:6zio', 'alone'],
      ['pdb:3con', 'alone'],
      ['pdb:9btm', 'partner'],
      ['complex:AF-0000000210513113', 'partner'],
      ['pdb:7ow4', 'fragment'],
    ])
  })

  it('describes each row as the list shows it', () => {
    const byKey = new Map(nrasRows().map(r => [r.key, r]))
    expect(byKey.get('alphafold')).toMatchObject({
      label: 'AF-P01111-F1',
      title: 'AlphaFold model of the full-length protein',
      predicted: true,
      start: 1,
      end: 189,
    })
    expect(byKey.get('pdb:6zio')).toMatchObject({
      label: '6ZIO',
      title: 'Crystal structure of NRAS (C118S) in complex with GDP',
      predicted: false,
      partners: [],
    })
    expect(byKey.get('pdb:9btm')?.partners).toEqual([
      { label: 'Leucine-rich repeat protein SHOC-2', title: 'Q9UQ13' },
    ])
    expect(byKey.get('complex:AF-0000000210513113')).toMatchObject({
      title: 'NRAS with RasGAP-activating-like protein 1',
      partners: [
        {
          label: 'RASAL1',
          title: 'RasGAP-activating-like protein 1, Q9UJF2',
        },
      ],
      notes: [{ label: 'heterodimer' }],
    })
  })

  it('places entries by coverage alone until RCSB describes them', () => {
    const rows = structureRows({
      geneName: 'NRAS',
      uniprotId: NRAS,
      uniprotLength: 189,
      entries: ENTRIES,
    })
    expect(rows.map(r => r.section)).toEqual([
      'alone',
      'alone',
      'alone',
      'fragment',
    ])
    expect(rows[0]?.title).toBe('PDB entry 6ZIO')
  })

  it('filters by source', () => {
    const rows = nrasRows()
    expect(
      rows.filter(r => matchesFilter(r, 'experimental')).map(r => r.key),
    ).toEqual(['pdb:6zio', 'pdb:9btm', 'pdb:3con', 'pdb:7ow4'])
    expect(
      rows.filter(r => matchesFilter(r, 'predicted')).map(r => r.key),
    ).toEqual(['alphafold', 'complex:AF-0000000210513113'])
    expect(rows.filter(r => matchesFilter(r, 'all'))).toHaveLength(6)
  })
})

describe('addedRows', () => {
  const listed = nrasRows()
  const added = (summaries?: ReadonlyMap<string, PdbEntrySummary>) =>
    addedRows({
      pdbIds: ['9btm', '1abc', '6zio'],
      summaries,
      listed,
      geneName: 'NRAS',
      uniprotId: NRAS,
    })

  it('lists an entry under its id until RCSB describes it', () => {
    expect(added().rows.map(r => [r.key, r.section, r.title])).toEqual([
      ['pdb:1abc', 'added', 'PDB entry 1ABC'],
    ])
    expect(added().unknown).toEqual([])
  })

  it('leaves out the entries the listing holds and those RCSB does not know', () => {
    const shoc2 = SUMMARIES.get('9btm')!
    const { rows, unknown } = addedRows({
      pdbIds: ['9btm', '1abc'],
      summaries: new Map([['9btm', shoc2]]),
      listed: [],
      geneName: 'NRAS',
      uniprotId: NRAS,
    })
    expect(rows).toEqual([
      expect.objectContaining({
        key: 'pdb:9btm',
        kind: 'added',
        title: 'NRas 1-169 Q61R in Complex with Shoc2 80-582',
        partners: [
          { label: 'Leucine-rich repeat protein SHOC-2', title: 'Q9UQ13' },
        ],
      }),
    ])
    expect(unknown).toEqual(['1abc'])
    expect(added(SUMMARIES).rows).toEqual([])
  })

  it('opens beside the checked rows rather than in place of them', () => {
    const [row] = added().rows
    expect(toggleStructure(['alphafold'], row!, listed)).toEqual([
      'alphafold',
      'pdb:1abc',
    ])
  })
})

describe('addPdbId', () => {
  const rows = nrasRows()
  const add = (
    pdbId: string,
    added: AddedEntry[] = [],
    checked: string[] = ['alphafold'],
    unknown: string[] = [],
  ) => addPdbId({ pdbId, added, unknown, checked, rows })

  it('adds a new id checked and last, leaving the listed pick alone', () => {
    expect(
      add('1abc', [{ pdbId: '2xyz', checked: false }], ['alphafold']),
    ).toEqual({
      listed: ['alphafold'],
      added: [
        { pdbId: '2xyz', checked: false },
        { pdbId: '1abc', checked: true },
      ],
    })
  })

  it('checks an id added before again rather than adding it twice', () => {
    expect(add('1abc', [{ pdbId: '1abc', checked: false }]).added).toEqual([
      { pdbId: '1abc', checked: true },
    ])
  })

  it('checks a listed entry in its section, and keeps it as added', () => {
    const { listed, added } = add('9btm')
    expect(listed).toEqual(['alphafold'])
    expect(added).toEqual([{ pdbId: '9btm', checked: true }])
    expect(checkedKeys(listed, added)).toEqual(['alphafold', 'pdb:9btm'])
  })

  it('drops ids RCSB has no entry for', () => {
    expect(
      add('1abc', [{ pdbId: '9zzz', checked: true }], [], ['9zzz']).added,
    ).toEqual([{ pdbId: '1abc', checked: true }])
  })

  it('unchecks a checked short fragment, which opens alone', () => {
    expect(add('1abc', [], ['pdb:7ow4']).listed).toEqual([])
  })

  it('keeps an added entry checked when the accession changes', () => {
    // added while the lookup ran, so the listed pick was empty
    const { added } = add('6zio', [], [])
    // the lookup lands: the listed pick resets to the default
    expect(checkedKeys(defaultChecked(rows), added)).toEqual([
      'alphafold',
      'pdb:6zio',
    ])
    const unchecked = splitChecked(['alphafold'], added)
    expect(unchecked.added).toEqual([{ pdbId: '6zio', checked: false }])
  })
})

describe('checking rows', () => {
  const rows = nrasRows()
  const row = (key: string) => rows.find(r => r.key === key)!

  it('checks the AlphaFold model by default, else the first listed', () => {
    expect(defaultChecked(rows)).toEqual(['alphafold'])
    expect(defaultChecked(rows.filter(r => r.kind === 'pdb'))).toEqual([
      'pdb:6zio',
    ])
    expect(defaultChecked([])).toEqual([])
  })

  it('adds a row beside the checked ones, and unchecks a checked one', () => {
    expect(toggleStructure(['alphafold'], row('pdb:9btm'), rows)).toEqual([
      'alphafold',
      'pdb:9btm',
    ])
    expect(
      toggleStructure(['alphafold', 'pdb:9btm'], row('alphafold'), rows),
    ).toEqual(['pdb:9btm'])
  })

  it('folds a section to its first rows, never hiding a checked one', () => {
    expect(firstRowsAndChecked(rows, ['pdb:7ow4'], 2).map(r => r.key)).toEqual([
      'alphafold',
      'pdb:6zio',
      'pdb:7ow4',
    ])
    expect(firstRowsAndChecked(rows, [], 10)).toHaveLength(rows.length)
  })

  it('opens a short fragment alone', () => {
    expect(
      toggleStructure(['alphafold', 'pdb:9btm'], row('pdb:7ow4'), rows),
    ).toEqual(['pdb:7ow4'])
    expect(toggleStructure(['pdb:7ow4'], row('alphafold'), rows)).toEqual([
      'alphafold',
    ])
  })
})
