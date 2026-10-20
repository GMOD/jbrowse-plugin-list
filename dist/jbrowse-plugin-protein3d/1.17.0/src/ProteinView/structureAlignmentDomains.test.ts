import { types } from '@jbrowse/mobx-state-tree'
import { autorun, observable, runInAction } from 'mobx'
import { expect, test, vi } from 'vitest'

import Structure from './structureModel'

import type { ConnectedDomain } from './alignmentDomains'
import type { ProteinColor } from './proteinColor'
import type { PlacedValues } from './variantEffects'
import type * as JBrowseCoreUtil from '@jbrowse/core/util'

const testSession = vi.hoisted(() => ({ views: [] as unknown[] }))

// hg19 spells chr11 as 11, as the alignment's regions do
vi.mock('@jbrowse/core/util', async importActual => {
  const actual = await importActual<typeof JBrowseCoreUtil>()
  return {
    ...actual,
    getSession: () => ({
      hovered: undefined,
      views: testSession.views,
      assemblyManager: {
        get: (name: string) =>
          name === 'hg19'
            ? {
                name,
                initialized: true,
                getCanonicalRefName: (r: string) => r.replace(/^chr/, ''),
              }
            : undefined,
      },
    }),
  }
})

const TestParent = types
  .model({ structures: types.array(Structure) })
  .volatile((): { color: ProteinColor } => ({
    color: { field: 'domain' },
  }))
  .views(() => ({
    get alignmentAlgorithm() {
      return 'needleman_wunsch' as const
    },
    get molstarPluginContext() {
      return undefined
    },
  }))
  .actions(self => ({
    setColor(color: ProteinColor) {
      self.color = color
    },
    setError(e: unknown) {
      throw e
    },
  }))

// minus strand: residues 0-3 on bases 211..200, residues 4-6 on 108..100
const feature = {
  uniqueId: 'tx1',
  refName: 'chr11',
  start: 100,
  end: 212,
  strand: -1,
  type: 'mRNA',
  name: 'NM_HBB_TEST',
  subfeatures: [
    { uniqueId: 'c1', refName: 'chr11', start: 100, end: 109, type: 'CDS' },
    { uniqueId: 'c2', refName: 'chr11', start: 200, end: 212, type: 'CDS' },
  ],
}

const outer: ConnectedDomain = {
  name: 'Hb beta-like',
  accession: 'cd08925',
  kind: 'domain',
  regions: [
    { refName: '11', start: 103, end: 109 },
    { refName: '11', start: 200, end: 206 },
  ],
}
const site: ConnectedDomain = {
  name: 'heme binding site',
  accession: 'site',
  kind: 'site',
  regions: [{ refName: '11', start: 106, end: 109 }],
}
const color = {
  field: 'accession' as const,
  domain: ['cd08925', 'site'],
  range: ['#F8766D', '#00BFC4'],
  labels: ['Hb beta-like', 'heme binding site'],
}

function setup() {
  const connectedDomains: unknown = { features: [outer, site], color }
  const msa = observable({
    id: 'msa',
    type: 'MsaView',
    connectedViewId: 'lgv',
    connectedDomains,
  })
  testSession.views = observable([
    { id: 'lgv', type: 'LinearGenomeView', assemblyNames: ['hg19'] },
    msa,
  ])
  const parent = TestParent.create({
    structures: [
      {
        url: 'x.cif',
        connectedViewId: 'lgv',
        feature,
        // the crystal lacks the initiator methionine
        pairwiseAlignment: {
          consensus: ' ||||||',
          alns: [
            { id: 'transcript', seq: 'MVHLTPE' },
            { id: 'structure', seq: '-VHLTPE' },
          ],
        },
      },
    ],
  })
  const structure = parent.structures[0]!
  structure.setStructureData({
    entities: [
      {
        entityId: '1',
        seq: 'VHLTPE',
        seqIds: [1, 2, 3, 4, 5, 6],
        chains: ['A'],
      },
    ],
  })
  structure.setLoadedToMolstar(true)
  return { parent, structure, msa }
}

test("a structure takes the connected alignment's domains, one layer per kind, and follows them as they change", () => {
  const { structure, msa } = setup()
  const seen: (PlacedValues | undefined)[] = []
  const seenSites: (PlacedValues | undefined)[] = []
  const dispose = autorun(() => {
    seen.push(structure.placedValues)
    seenSites.push(structure.alignmentDomainStatus?.placedSites)
  })
  expect(structure.statusMessage).toBeUndefined()
  expect(structure.alignmentDomainStatus?.domains?.color).toEqual(color)
  // the site is layer 2's, so the cartoon keeps the domain under it
  expect(seen.at(-1)).toEqual({
    entityId: '1',
    byLabelSeqId: new Map([
      [2, 0],
      [3, 0],
      [4, 0],
      [5, 0],
    ]),
  })
  expect(seenSites.at(-1)).toEqual({
    entityId: '1',
    byLabelSeqId: new Map([[4, 1]]),
  })

  runInAction(() => {
    msa.connectedDomains = { features: [outer], color }
  })
  expect(seen.at(-1)?.byLabelSeqId.get(4)).toBe(0)
  expect(seenSites.at(-1)?.byLabelSeqId.size).toBe(0)

  runInAction(() => {
    msa.connectedDomains = { features: [], color }
  })
  expect(seen.at(-1)).toBeUndefined()
  expect(structure.statusMessage).toBe(
    'The connected alignment shows no domains',
  )
  dispose()
})

test("msaview 5.5.0's array, with no kind, draws every entry on the cartoon", () => {
  const { structure, msa } = setup()
  runInAction(() => {
    msa.connectedDomains = [
      { ...outer, kind: undefined, color: '#F8766D' },
      { ...site, kind: undefined, color: '#00BFC4' },
    ]
  })
  expect(structure.placedValues?.byLabelSeqId.get(4)).toBe(1)
  expect(structure.alignmentDomainStatus?.placedSites?.byLabelSeqId.size).toBe(
    0,
  )
  expect(structure.alignmentDomainStatus?.domains?.color.range).toEqual([
    '#F8766D',
    '#00BFC4',
  ])
})

test('the overview rows show whatever the view colors by', () => {
  const { parent, structure } = setup()
  parent.setColor({ field: 'chain' })
  expect(structure.domainRows.map(r => [r.label, r.kind])).toEqual([
    ['Hb beta-like', 'domain'],
    ['heme binding site', 'site'],
  ])
})

test('another scheme reads no domains and says nothing about them', () => {
  const { parent, structure } = setup()
  parent.setColor({ field: 'chain' })
  expect(structure.alignmentDomainStatus).toBeUndefined()
  expect(structure.placedValues).toBeUndefined()
  expect(structure.statusMessage).toBeUndefined()
})
