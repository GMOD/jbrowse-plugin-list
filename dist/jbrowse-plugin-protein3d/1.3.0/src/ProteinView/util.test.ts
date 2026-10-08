import { expect, test } from 'vitest'

import {
  assemblyNaming,
  genomeHoverToTranscriptPos,
  literalNaming,
} from './util'

// g2p is keyed by 0-based genome position; hovered.coord is 1-based display
const mapping = { refName: 'chr17', g2p: { 999: 4, 1002: 5 } }
const hoveredAt = (refName: string, coord: number, assemblyName?: string) => ({
  hoverPosition: { refName, coord, assemblyName },
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
  const naming = {
    ...literalNaming,
    canonicalRefName: (r: string) => r.replace(/^chr/, ''),
  }
  expect(
    genomeHoverToTranscriptPos(hoveredAt('17', 1000), mapping, naming),
  ).toBe(4)
  // and still refuses a genuinely different chromosome
  expect(
    genomeHoverToTranscriptPos(hoveredAt('1', 1000), mapping, naming),
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

function assemblyManager(loaded: boolean) {
  const assemblies = [
    {
      name: 'hg38',
      aliases: ['GRCh38'],
      initialized: loaded,
      getCanonicalRefName: (r: string) => {
        if (!loaded) {
          throw new Error('aliases not loaded')
        }
        return r.replace(/^chr/, '')
      },
    },
    {
      name: 'hg19',
      aliases: [],
      initialized: loaded,
      getCanonicalRefName: (r: string) => r,
    },
  ]
  return {
    get: (name: string) =>
      assemblies.find(a => a.name === name || a.aliases.includes(name)),
  }
}

// A synteny row or a second genome view on hg19 also spells chr17, and the
// same number there is a different base.
test('genomeHoverToTranscriptPos ignores a hover on another assembly', () => {
  const naming = assemblyNaming(assemblyManager(true), 'hg38')
  expect(
    genomeHoverToTranscriptPos(hoveredAt('17', 1000, 'hg38'), mapping, naming),
  ).toBe(4)
  expect(
    genomeHoverToTranscriptPos(
      hoveredAt('17', 1000, 'GRCh38'),
      mapping,
      naming,
    ),
  ).toBe(4)
  expect(
    genomeHoverToTranscriptPos(hoveredAt('17', 1000, 'hg19'), mapping, naming),
  ).toBeUndefined()
})

test('assemblyNaming reads names raw until the aliases load, rather than throwing', () => {
  const { canonicalRefName } = assemblyNaming(assemblyManager(false), 'hg38')
  expect(canonicalRefName('chr17')).toBe('chr17')
})

test('assemblyNaming accepts no named hover for an assembly it cannot find', () => {
  const { isAssembly } = assemblyNaming(assemblyManager(true), undefined)
  expect(isAssembly('hg38')).toBe(false)
  expect(isAssembly(undefined)).toBe(true)
})
