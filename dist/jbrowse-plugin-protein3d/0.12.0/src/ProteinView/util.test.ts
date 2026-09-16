import { expect, test } from 'vitest'

import { genomeHoverToTranscriptPos } from './util'

// g2p is keyed by 0-based genome position; hovered.coord is 1-based display
const mapping = { refName: 'chr17', g2p: { 999: 4, 1002: 5 } }
const hoveredAt = (refName: string, coord: number) => ({
  hoverPosition: { refName, coord },
})

test('genomeHoverToTranscriptPos maps a hover on the transcript refName', () => {
  expect(genomeHoverToTranscriptPos(hoveredAt('chr17', 1000), mapping)).toBe(4)
})

test('genomeHoverToTranscriptPos ignores a hover on another refName', () => {
  // the same numeric coordinate on an unrelated chromosome matches a g2p key,
  // so without the refName gate this reported residue 4 for a different locus
  expect(
    genomeHoverToTranscriptPos(hoveredAt('chr1', 1000), mapping),
  ).toBeUndefined()
})

// The two sides name the chromosome independently: the view reports the
// assembly's canonical name, the mapping the feature's, out of the file. Every
// fixture above spells them the same, which is why nothing caught this until an
// e2e hovered a real jbrowse.org hg38 session and saw `1` meet `chr17`'s twin.
test('genomeHoverToTranscriptPos resolves aliases before comparing refNames', () => {
  const canonical = (r: string) => r.replace(/^chr/, '')
  expect(
    genomeHoverToTranscriptPos(hoveredAt('17', 1000), mapping, canonical),
  ).toBe(4)
  // and still refuses a genuinely different chromosome
  expect(
    genomeHoverToTranscriptPos(hoveredAt('1', 1000), mapping, canonical),
  ).toBeUndefined()
})

test('genomeHoverToTranscriptPos returns undefined off the CDS', () => {
  expect(
    genomeHoverToTranscriptPos(hoveredAt('chr17', 1001), mapping),
  ).toBeUndefined()
})

test('genomeHoverToTranscriptPos tolerates no mapping and no hover', () => {
  expect(
    genomeHoverToTranscriptPos(hoveredAt('chr17', 1000), undefined),
  ).toBeUndefined()
  expect(genomeHoverToTranscriptPos(undefined, mapping)).toBeUndefined()
  expect(genomeHoverToTranscriptPos({}, mapping)).toBeUndefined()
})
