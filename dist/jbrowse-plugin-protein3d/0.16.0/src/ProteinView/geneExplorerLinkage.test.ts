import { types } from '@jbrowse/mobx-state-tree'
import { expect, test, vi } from 'vitest'

import {
  navigateToProteinPosition,
  structureRangesToGenomeRegions,
} from './proteinToGenomeMapping'
import Structure from './structureModel'

import type * as JBrowseCoreUtil from '@jbrowse/core/util'
import type { AlignmentAlgorithm } from 'p2s_mapper'

vi.mock('@jbrowse/core/util', async importActual => {
  const actual = await importActual<typeof JBrowseCoreUtil>()
  return { ...actual, getSession: () => ({ hovered: undefined, views: [] }) }
})

// The real TP53 knownCanonical CDS the gene explorer now emits in its .cds
// sidecar (chr17, minus strand, 0-based interbase, with codon phase). This is
// the exact connectedFeature buildSessionSpec passes the ProteinView, so this
// test reproduces the gene-explorer 3D->genome linkage with real coordinates.
const TP53_CDS = [
  { start: 7669608, end: 7669690, phase: 1 },
  { start: 7670608, end: 7670715, phase: 0 },
  { start: 7673534, end: 7673608, phase: 2 },
  { start: 7673700, end: 7673837, phase: 1 },
  { start: 7674180, end: 7674290, phase: 0 },
  { start: 7674858, end: 7674971, phase: 2 },
  { start: 7675052, end: 7675236, phase: 0 },
  { start: 7675993, end: 7676272, phase: 0 },
  { start: 7676381, end: 7676403, phase: 1 },
  { start: 7676520, end: 7676594, phase: 0 },
]
const CDS_BP = TP53_CDS.reduce((s, c) => s + (c.end - c.start), 0) // 1182
const PROTEIN_LEN = CDS_BP / 3 // 394 (393 aa + stop)
const CDS_MIN = Math.min(...TP53_CDS.map(c => c.start))
const CDS_MAX = Math.max(...TP53_CDS.map(c => c.end))

const tp53Feature = {
  uniqueId: 'ENST00000269305.9',
  type: 'mRNA',
  refName: 'chr17',
  start: CDS_MIN,
  end: CDS_MAX,
  strand: -1,
  name: 'TP53',
  subfeatures: TP53_CDS.map(c => ({
    type: 'CDS',
    start: c.start,
    end: c.end,
    strand: -1,
    phase: c.phase,
  })),
}

// identity alignment: structure sequence == the transcript translation, so
// structureSeqPos maps 1:1 to transcript position (the clean-gene case, ~79% of
// genes; divergent genes degrade gracefully via the real pairwise alignment)
const identitySeq = 'M'.repeat(PROTEIN_LEN)
const pairwiseAlignment = {
  consensus: '|'.repeat(PROTEIN_LEN),
  alns: [
    { id: 'structure', seq: identitySeq },
    { id: 'transcript', seq: identitySeq },
  ],
}

const TestParent = types
  .model({ structures: types.array(Structure) })
  .views(() => ({
    get zoomToBaseLevel() {
      return false
    },
    get autoScrollAlignment() {
      return false
    },
    get showHighlight() {
      return false
    },
    get showProteinTracks() {
      return false
    },
    get alignmentAlgorithm(): AlignmentAlgorithm {
      return 'needleman_wunsch'
    },
    get molstarPluginContext() {
      return undefined
    },
  }))
  .actions(() => ({
    setError(_: unknown) {},
  }))

function makeModel() {
  return TestParent.create({
    structures: [
      {
        feature: tp53Feature,
        userProvidedTranscriptSequence: identitySeq,
        pairwiseAlignment,
      },
    ],
  }).structures[0]!
}

function mappingModel(model: ReturnType<typeof makeModel>) {
  return {
    genomeToTranscriptSeqMapping: model.genomeToTranscriptSeqMapping,
    pairwiseAlignment: model.pairwiseAlignment,
    structureSeqToTranscriptSeqPosition:
      model.structureSeqToTranscriptSeqPosition,
  }
}

// The genome span one structure residue's codon covers, first base to last
function codonSpan(
  model: ReturnType<typeof mappingModel>,
  structureSeqPos: number,
) {
  const regions = structureRangesToGenomeRegions({
    ranges: [{ start: structureSeqPos, end: structureSeqPos + 1 }],
    assemblyName: 'hg38',
    model,
  })
  const first = regions[0]
  const last = regions.at(-1)
  return first && last ? ([first.start, last.end] as const) : undefined
}

test('TP53 CDS builds a genome<->transcript mapping spanning the whole protein', () => {
  const model = makeModel()
  const m = model.genomeToTranscriptSeqMapping
  expect(m).toBeDefined()
  expect(m!.refName).toBe('chr17')
  expect(m!.strand).toBe(-1)
  // p2g covers every protein position (proves CDS feature == alignment space)
  expect(Object.keys(m!.p2g).length).toBe(PROTEIN_LEN)
})

test('structure residue maps to an in-CDS genome codon', () => {
  const model = makeModel()
  const mid = Math.floor(PROTEIN_LEN / 2)
  const r = codonSpan(mappingModel(model), mid)
  expect(r).toBeDefined()
  const [start, end] = r!
  expect(end - start).toBe(3) // one codon
  expect(start).toBeGreaterThanOrEqual(CDS_MIN)
  expect(end).toBeLessThanOrEqual(CDS_MAX)
})

test('adjacent residues are exactly one codon apart, in minus-strand order', () => {
  const model = makeModel()
  const m = mappingModel(model)
  const a = codonSpan(m, 100)!
  const b = codonSpan(m, 101)!
  expect(Math.abs(a[0] - b[0])).toBe(3)
  // minus strand: the next residue sits at a lower genome coordinate
  expect(b[0]).toBeLessThan(a[0])
})

test('the start codon maps to the top of the CDS (minus strand)', () => {
  const model = makeModel()
  const first = codonSpan(mappingModel(model), 0)!
  // residue 0 (Met) is the 3'-most genome position for a minus-strand gene
  expect(first[1]).toBe(CDS_MAX)
})

test('zoomToBaseLevel navigation emits a 1-based locString for the codon', async () => {
  const model = makeModel()
  const mid = Math.floor(PROTEIN_LEN / 2)
  const [start, end] = codonSpan(mappingModel(model), mid)!

  let locString: string | undefined
  const connectedView = {
    assemblyNames: ['hg38'],
    async navToLocString(input: string) {
      locString = input
    },
  }

  await navigateToProteinPosition({
    model: {
      ...mappingModel(model),
      connectedView,
    } as unknown as Parameters<typeof navigateToProteinPosition>[0]['model'],
    structureSeqPos: mid,
    zoomToBaseLevel: true,
  })

  // getCodonRanges yields 0-based half-open [start, end); the locString start
  // must be 1-based (parseLocString subtracts 1), so it reads start+1..end.
  expect(locString).toBe(`chr17:${start + 1}-${end}[rev]`)
})

test('genome<->protein hover directions are mutual inverses', () => {
  const model = makeModel()
  const m = model.genomeToTranscriptSeqMapping!
  // for every CDS base, the residue it maps to (genome->protein direction) must
  // report a codon span (protein->genome direction) that contains that base.
  // Guards against either direction drifting by a base independently.
  for (const genomePos of Object.keys(m.g2p).map(Number)) {
    const proteinPos = m.g2p[genomePos]!
    const [start, end] = codonSpan(mappingModel(model), proteinPos)!
    expect(genomePos).toBeGreaterThanOrEqual(start)
    expect(genomePos).toBeLessThan(end)
  }
})

test('every structure residue round-trips to a unique in-CDS codon', () => {
  const model = makeModel()
  const m = mappingModel(model)
  const seen = new Set<number>()
  for (let pos = 0; pos < PROTEIN_LEN; pos++) {
    const r = codonSpan(m, pos)
    expect(r).toBeDefined()
    const [start, end] = r!
    expect(start).toBeGreaterThanOrEqual(CDS_MIN)
    expect(end).toBeLessThanOrEqual(CDS_MAX)
    seen.add(start)
  }
  expect(seen.size).toBe(PROTEIN_LEN) // no two residues collide on a codon
})

function genomeRegions(...ranges: { start: number; end: number }[]) {
  return structureRangesToGenomeRegions({
    ranges,
    assemblyName: 'hg38',
    model: mappingModel(makeModel()),
  }).map(({ start, end }) => ({ start, end }))
}

const inCds = (r: { start: number; end: number }) =>
  TP53_CDS.some(c => r.start >= c.start && r.end <= c.end)

test('a codon split by an intron highlights both halves and not the intron', () => {
  const split = Array.from({ length: PROTEIN_LEN }, (_, pos) =>
    genomeRegions({ start: pos, end: pos + 1 }),
  ).filter(regions => regions.length > 1)
  // a CDS segment starting mid-codon (phase 1 or 2) splits that codon with the
  // segment before it
  expect(split.length).toBe(TP53_CDS.filter(c => c.phase !== 0).length)
  for (const regions of split) {
    expect(regions).toHaveLength(2)
    expect(regions.every(inCds)).toBe(true)
    expect(regions.reduce((n, r) => n + r.end - r.start, 0)).toBe(3)
  }
})

test('a range across the whole protein highlights exactly the CDS', () => {
  expect(genomeRegions({ start: 0, end: PROTEIN_LEN })).toEqual(
    TP53_CDS.map(({ start, end }) => ({ start, end })),
  )
})

test('several ranges highlight their own codons and nothing between', () => {
  const a = { start: 10, end: 11 }
  const b = { start: 20, end: 21 }
  const both = genomeRegions(a, b)
  expect(both.reduce((n, r) => n + r.end - r.start, 0)).toBe(6)
  expect(both).toEqual(
    expect.arrayContaining([...genomeRegions(a), ...genomeRegions(b)]),
  )
})
