import { genomeToTranscriptSeqMapping } from 'g2p_mapper'
import { expect, test } from 'vitest'

import {
  alignmentDomainStatus,
  domainIndexByTranscriptPos,
} from './alignmentDomains'
import { literalNaming } from './util'

import type { ConnectedDomain } from './alignmentDomains'
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

// most residues first, as msaview lists them
const domains: ConnectedDomain[] = [
  {
    name: 'Hb beta-like',
    accession: 'cd08925',
    color: '#F8766D',
    // residues 2-5, across the intron
    regions: [
      { refName: '11', start: 103, end: 109 },
      { refName: '11', start: 200, end: 206 },
    ],
  },
  {
    name: 'heme binding site',
    accession: 'cd08925-heme',
    color: 'rgb(0, 191, 196)',
    // residue 4, inside the domain, plus one base of residue 1's codon
    regions: [
      { refName: '11', start: 106, end: 109 },
      { refName: '11', start: 208, end: 209 },
    ],
  },
  {
    name: 'elsewhere',
    accession: 'x',
    color: 'blue',
    regions: [{ refName: '12', start: 100, end: 212 }],
  },
]

test('a minus-strand transcript takes each residue from the last domain over its codon', () => {
  expect(mapping.g2p[211]).toBe(0)
  expect(mapping.g2p[100]).toBe(6)
  expect(domainIndexByTranscriptPos(domains, mapping, naming)).toEqual(
    new Map([
      [1, 1],
      [2, 0],
      [3, 0],
      [4, 1],
      [5, 0],
    ]),
  )
})

test('the two spellings of a chromosome meet only through the assembly', () => {
  expect(domainIndexByTranscriptPos(domains, mapping, literalNaming).size).toBe(
    0,
  )
})

test('a site of scattered codons marks each one, a codon split by an intron included', () => {
  // exons of 10 and 11 bases: residue 3 is bases 201, 200 and 109
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
  expect(split.p2gCodon[3]).toEqual([201, 200, 109])
  const site = (regions: [number, number][]) => ({
    name: 'site',
    accession: 'site',
    color: '#619CFF',
    regions: regions.map(([start, end]) => ({ refName: '11', start, end })),
  })
  expect(
    domainIndexByTranscriptPos(
      [
        site([
          [100, 110],
          [200, 211],
        ]),
        site([
          [205, 208],
          [200, 202],
          [109, 110],
          [103, 106],
        ]),
      ],
      split,
      naming,
    ),
  ).toEqual(
    new Map([
      [0, 0],
      [1, 1],
      [2, 0],
      [3, 1],
      [4, 0],
      [5, 1],
      [6, 0],
    ]),
  )
})

const views = [
  { id: 'msa', type: 'MsaView', connectedViewId: 'lgv', connectedDomains: [] },
  {
    id: 'msa2',
    type: 'MsaView',
    connectedViewId: 'lgv',
    connectedDomains: domains,
  },
]

test("places the domains on the mapped entity through the structure's alignment", () => {
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
  expect(status.domains).toEqual([
    { name: 'Hb beta-like', color: 0xf8766d },
    { name: 'heme binding site', color: 0x00bfc4 },
    { name: 'elsewhere', color: 0x0000ff },
  ])
  expect(status.message).toBeUndefined()
  expect(status.placed).toEqual({
    entityId: '1',
    byLabelSeqId: new Map([
      [1, 1],
      [2, 0],
      [3, 0],
      [4, 1],
      [5, 0],
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
    domains: expect.any(Array),
    placed: undefined,
  })
})
