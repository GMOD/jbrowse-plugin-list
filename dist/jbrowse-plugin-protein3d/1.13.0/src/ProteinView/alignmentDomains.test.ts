import { genomeToTranscriptSeqMapping } from 'g2p_mapper'
import { describe, expect, test } from 'vitest'

import {
  alignmentDomainStatus,
  domainLegend,
  domainRows,
  layerByTranscriptPos,
  placeOnTranscript,
  readConnectedDomains,
} from './alignmentDomains'
import { literalNaming } from './util'

import type { ConnectedDomains } from './alignmentDomains'
import type { GenomeNaming } from './util'

// A minus-strand transcript like HBB's, two coding exons on chr11. Translation
// starts at the high end, so residues 0-3 are exon 2's bases 211..200 and
// residues 4-6 exon 1's 108..100.
const mapping = genomeToTranscriptSeqMapping({
  refName: 'chr11',
  start: 100,
  end: 212,
  strand: -1,
  subfeatures: [
    { refName: 'chr11', start: 100, end: 109, strand: -1, type: 'CDS' },
    { refName: 'chr11', start: 200, end: 212, strand: -1, type: 'CDS' },
  ],
})

// the genome view's assembly spells chr11 as 11, as msaview's regions do
const naming: GenomeNaming = {
  canonicalRefName: r => r.replace(/^chr/, ''),
  isAssembly: () => true,
}

// HBB's shape: a domain, and two sites inside it that share a residue, as the
// heme site and the tetramer interface share 103
const domains: ConnectedDomains = {
  features: [
    {
      name: 'Hb beta-like',
      accession: 'cd08925',
      kind: 'domain',
      // residues 2-5, across the intron
      regions: [
        { refName: '11', start: 103, end: 109 },
        { refName: '11', start: 200, end: 206 },
      ],
    },
    {
      name: 'tetramer interface',
      accession: 'cd08925:tetramer',
      kind: 'site',
      // residues 1, 3 and 4
      regions: [
        { refName: '11', start: 106, end: 109 },
        { refName: '11', start: 200, end: 203 },
        { refName: '11', start: 206, end: 209 },
      ],
    },
    {
      name: 'heme binding site',
      accession: 'cd08925:heme',
      kind: 'site',
      // residue 4, plus one base of residue 1's codon
      regions: [
        { refName: '11', start: 106, end: 109 },
        { refName: '11', start: 208, end: 209 },
      ],
    },
    {
      name: 'elsewhere',
      accession: 'x',
      kind: 'domain',
      regions: [{ refName: '12', start: 100, end: 212 }],
    },
  ],
  color: {
    field: 'accession',
    domain: ['cd08925', 'cd08925:tetramer', 'cd08925:heme', 'x'],
    range: ['#F8766D', '#7CAE00', 'rgb(0, 191, 196)', 'blue'],
    labels: ['Hb beta-like', 'tetramer interface', 'heme binding site', 'x'],
  },
}

describe('two layers, one per kind', () => {
  const placed = placeOnTranscript(domains, mapping, naming)

  test('the cartoon layer holds the domains alone, under every site', () => {
    expect(layerByTranscriptPos(placed, 'domain')).toEqual(
      new Map([
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
      ]),
    )
  })

  test('the sticks layer holds the sites, the smaller drawn on top where two meet', () => {
    expect(layerByTranscriptPos(placed, 'site')).toEqual(
      new Map([
        [1, 2],
        [3, 1],
        [4, 2],
      ]),
    )
  })

  test('draw order follows size, not the order the features arrive in', () => {
    const reversed = placeOnTranscript(
      { ...domains, features: domains.features.toReversed() },
      mapping,
      naming,
    )
    expect(layerByTranscriptPos(reversed, 'site')).toEqual(
      layerByTranscriptPos(placed, 'site'),
    )
  })

  test('the two spellings of a chromosome meet only through the assembly', () => {
    expect(placeOnTranscript(domains, mapping, literalNaming)).toEqual([])
  })

  test('a feature the color domain leaves out has no color and is not drawn', () => {
    const color = { ...domains.color, domain: ['cd08925'] }
    expect(
      placeOnTranscript({ ...domains, color }, mapping, naming).map(
        p => p.feature.accession,
      ),
    ).toEqual(['cd08925'])
  })
})

describe('readConnectedDomains', () => {
  test('reads the current shape as it stands', () => {
    expect(readConnectedDomains(domains)).toEqual(domains)
  })

  test("reads msaview 5.5.0's array, with no kind and a color on each record, as domains", () => {
    const old = [
      {
        name: 'Hb beta-like',
        accession: 'cd08925',
        color: '#F8766D',
        regions: [{ refName: '11', start: 103, end: 109 }],
      },
      {
        name: 'heme binding site',
        accession: 'cd08925:heme',
        color: '#00BFC4',
        regions: [{ refName: '11', start: 106, end: 109 }],
      },
    ]
    expect(readConnectedDomains(old)).toEqual({
      features: [
        {
          name: 'Hb beta-like',
          accession: 'cd08925',
          kind: 'domain',
          regions: [{ refName: '11', start: 103, end: 109 }],
        },
        {
          name: 'heme binding site',
          accession: 'cd08925:heme',
          kind: 'domain',
          regions: [{ refName: '11', start: 106, end: 109 }],
        },
      ],
      color: {
        field: 'accession',
        domain: ['cd08925', 'cd08925:heme'],
        range: ['#F8766D', '#00BFC4'],
        labels: ['Hb beta-like', 'heme binding site'],
      },
    })
  })

  test('a kind it does not know reads as a domain', () => {
    const [feature] = readConnectedDomains({
      ...domains,
      features: [{ ...domains.features[2], kind: 'motif' }],
    })!.features
    expect(feature!.kind).toBe('domain')
  })

  test('no features, or no color object, is nothing', () => {
    expect(readConnectedDomains([])).toBeUndefined()
    expect(readConnectedDomains({ ...domains, features: [] })).toBeUndefined()
    expect(readConnectedDomains({ features: domains.features })).toBeUndefined()
    expect(readConnectedDomains(undefined)).toBeUndefined()
  })
})

const views = [
  {
    id: 'msa',
    type: 'MsaView',
    connectedViewId: 'lgv',
    connectedDomains: { features: [], color: domains.color },
  },
  {
    id: 'msa2',
    type: 'MsaView',
    connectedViewId: 'lgv',
    connectedDomains: domains,
  },
]

test("places each layer on the mapped entity through the structure's alignment", () => {
  // the crystal lacks residue 0 and starts at label_seq_id 1
  const transcriptToStructure = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 }
  const status = alignmentDomainStatus({
    views,
    connectedViewId: 'lgv',
    mapping,
    naming,
    entity: { entityId: '1', seqIds: [1, 2, 3, 4, 5, 6] },
    transcriptToStructure,
  })
  expect(status.domains).toEqual(domains)
  expect(status.message).toBeUndefined()
  expect(status.placed).toEqual({
    entityId: '1',
    byLabelSeqId: new Map([
      [2, 0],
      [3, 0],
      [4, 0],
      [5, 0],
    ]),
  })
  expect(status.placedSites).toEqual({
    entityId: '1',
    byLabelSeqId: new Map([
      [1, 2],
      [3, 1],
      [4, 2],
    ]),
  })
})

test('says why a structure stays grey', () => {
  const status = (over: Partial<Parameters<typeof alignmentDomainStatus>[0]>) =>
    alignmentDomainStatus({
      views,
      connectedViewId: 'lgv',
      mapping,
      naming,
      entity: { entityId: '1', seqIds: [1] },
      transcriptToStructure: { 0: 0 },
      ...over,
    })
  expect(status({ connectedViewId: undefined }).message).toBe(
    'No genome view to read alignment domains through',
  )
  expect(status({ connectedViewId: 'other' }).message).toBe(
    "No alignment is connected to this structure's genome view",
  )
  expect(status({ views: views.slice(0, 1) }).message).toBe(
    'The connected alignment shows no domains',
  )
  expect(status({ mapping: undefined }).message).toBe(
    'No transcript to place alignment domains on',
  )
  expect(status({ naming: literalNaming }).message).toBe(
    "None of the alignment's domains fall on this transcript",
  )
  // the alignment to the transcript is still on its way
  expect(status({ transcriptToStructure: undefined })).toEqual({
    domains,
    placed: undefined,
    placedSites: undefined,
  })
})

describe('the overview rows', () => {
  // exons of 10 and 11 bases: residue 3 is bases 201, 200 and 109, a codon
  // the intron splits
  const split = genomeToTranscriptSeqMapping({
    refName: 'chr11',
    start: 100,
    end: 211,
    strand: -1,
    subfeatures: [
      { refName: 'chr11', start: 100, end: 110, strand: -1, type: 'CDS' },
      { refName: 'chr11', start: 200, end: 211, strand: -1, type: 'CDS' },
    ],
  })
  // a CDD site as msaview sends it: residues 1, 3 and 5, each codon its own
  // region, residue 3's in two pieces either side of the intron
  const site: ConnectedDomains = {
    features: [
      {
        name: 'domain',
        accession: 'd',
        kind: 'domain',
        regions: [
          { refName: '11', start: 100, end: 110 },
          { refName: '11', start: 200, end: 211 },
        ],
      },
      {
        name: 'site',
        accession: 's',
        kind: 'site',
        regions: [
          { refName: '11', start: 205, end: 208 },
          { refName: '11', start: 200, end: 202 },
          { refName: '11', start: 109, end: 110 },
          { refName: '11', start: 103, end: 106 },
        ],
      },
    ],
    color: {
      field: 'accession',
      domain: ['s', 'd'],
      range: ['#619CFF', '#F8766D'],
      labels: ['heme binding site', 'Hb beta-like'],
    },
  }
  // the structure lacks residue 0; an insertion in the structure puts
  // residue 4 two columns after residue 3
  const transcriptToStructure = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 }
  const structureToAlignment = { 0: 1, 1: 2, 2: 3, 3: 5, 4: 6, 5: 7 }

  const rows = domainRows({
    domains: site,
    mapping: split,
    naming,
    transcriptToStructure,
    structureToAlignment,
  })

  test('follow the color domain, each named and colored by the color object', () => {
    expect(split.p2gCodon[3]).toEqual([201, 200, 109])
    expect(rows.map(r => [r.accession, r.label, r.color, r.kind])).toEqual([
      ['s', 'heme binding site', '#619CFF', 'site'],
      ['d', 'Hb beta-like', '#F8766D', 'domain'],
    ])
  })

  test("a site's bars sit on its own residues, the split codon's included", () => {
    expect(rows[0]!.bars).toEqual([
      {
        structureStart: 0,
        structureEnd: 1,
        alignmentStart: 1,
        alignmentEnd: 1,
      },
      {
        structureStart: 2,
        structureEnd: 3,
        alignmentStart: 3,
        alignmentEnd: 3,
      },
      {
        structureStart: 4,
        structureEnd: 5,
        alignmentStart: 6,
        alignmentEnd: 6,
      },
    ])
  })

  test('a contiguous domain breaks only where the columns do', () => {
    expect(rows[1]!.bars).toEqual([
      {
        structureStart: 0,
        structureEnd: 3,
        alignmentStart: 1,
        alignmentEnd: 3,
      },
      {
        structureStart: 3,
        structureEnd: 6,
        alignmentStart: 5,
        alignmentEnd: 7,
      },
    ])
  })
})

test('the legend is one group per layer, in the color domain order', () => {
  expect(domainLegend(domains)).toEqual([
    {
      title: 'Domains (cartoon)',
      entries: [
        { label: 'Hb beta-like', color: '#F8766D' },
        { label: 'x', color: 'blue' },
      ],
    },
    {
      title: 'Sites (side chains)',
      entries: [
        { label: 'tetramer interface', color: '#7CAE00' },
        { label: 'heme binding site', color: 'rgb(0, 191, 196)' },
      ],
    },
  ])
})
