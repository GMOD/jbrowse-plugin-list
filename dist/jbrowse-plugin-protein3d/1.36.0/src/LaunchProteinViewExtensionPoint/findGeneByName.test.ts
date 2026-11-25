import { expect, test, vi } from 'vitest'

import { geneUnderHits, noGeneFound } from './findGeneByName'

const assembly = {
  isValidRefName: (refName: string) =>
    ['chr17', 'chr17_KI270729v1_random', 'chr17_KI270730v1_random'].includes(
      refName,
    ),
  getCanonicalRefName: (refName: string) => refName,
}

function hit(loc: string) {
  return { getLocation: () => loc, getTrackId: () => 'genes' }
}

function geneOn(region: { refName: string }) {
  return Promise.resolve(`TP53 on ${region.refName}`)
}

const ALT = 'chr17_KI270729v1_random:1-100'
const PRIMARY = 'chr17:7668421-7687550'

test('a hit on a refName the assembly does not know is passed over', async () => {
  const found = await geneUnderHits({
    hits: [hit('chrUn_JTFH01000001v1_decoy:1-100'), hit(PRIMARY)],
    assembly,
    trackIds: [],
    geneIn: geneOn,
  })
  expect(found).toEqual({ feature: 'TP53 on chr17', trackId: 'genes' })
})

test("a gene on the genome view's refName wins over an earlier hit", async () => {
  const hits = [hit(ALT), hit(PRIMARY)]
  expect(
    await geneUnderHits({
      hits,
      assembly,
      trackIds: [],
      preferredLoc: 'chr17:7,668,421-7,687,550',
      geneIn: geneOn,
    }),
  ).toEqual({ feature: 'TP53 on chr17', trackId: 'genes' })
})

test('with no preferred refName the first gene found ends the search', async () => {
  const geneIn = vi.fn(geneOn)
  expect(
    await geneUnderHits({
      hits: [hit(ALT), hit(PRIMARY)],
      assembly,
      trackIds: ['more-genes'],
      geneIn,
    }),
  ).toEqual({ feature: 'TP53 on chr17_KI270729v1_random', trackId: 'genes' })
  expect(geneIn).toHaveBeenCalledTimes(1)
})

test('once a gene is found, only hits on the preferred refName are fetched, and a failing one is passed over', async () => {
  const geneIn = vi.fn((region: { refName: string }) =>
    region.refName === 'chr17'
      ? Promise.reject(new Error('adapter failed'))
      : geneOn(region),
  )
  expect(
    await geneUnderHits({
      hits: [hit(ALT), hit('chr17_KI270730v1_random:1-100'), hit(PRIMARY)],
      assembly,
      trackIds: [],
      preferredLoc: 'chr17:7,668,421-7,687,550',
      geneIn,
    }),
  ).toEqual({ feature: 'TP53 on chr17_KI270729v1_random', trackId: 'genes' })
  expect(geneIn.mock.calls.map(([region]) => region.refName)).toEqual([
    'chr17_KI270729v1_random',
    'chr17',
  ])
})

test('a failing fetch before any gene is found fails the lookup', async () => {
  await expect(
    geneUnderHits({
      hits: [hit(PRIMARY)],
      assembly,
      trackIds: [],
      geneIn: () => Promise.reject(new Error('adapter failed')),
    }),
  ).rejects.toThrow('adapter failed')
})

test('no gene found says how many hits the assembly could not place', () => {
  const noAliases = {
    isValidRefName: (refName: string) => refName === '17',
    getCanonicalRefName: (refName: string) => refName,
  }
  expect(
    noGeneFound({
      gene: 'TP53',
      assemblyName: 'GRCh38',
      hits: [hit(PRIMARY), hit('17:7668421-7687550')],
      assembly: noAliases,
    }),
  ).toBe(
    'no coding gene named "TP53" in the tracks the GRCh38 search index names; 1 of the 2 search hits name a location GRCh38 cannot place, such as "chr17:7668421-7687550"; an index written with other reference names (chr17 for 17) needs refName aliases on the assembly',
  )
})
