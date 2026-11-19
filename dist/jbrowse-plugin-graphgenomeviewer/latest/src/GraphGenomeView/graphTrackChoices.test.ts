import { expect, test } from 'vitest'

import {
  firstLookLocString,
  graphTrackChoices,
  viewedLocString,
} from './graphTrackChoices'

import type { AnyTrackConfig } from '@jbrowse/core/configuration'

function track(
  trackId: string,
  adapter: Record<string, unknown>,
  assemblyNames = ['hg38'],
): AnyTrackConfig {
  return { trackId, name: trackId, assemblyNames, type: 'GraphTrack', adapter }
}

const overview = track('overview', {
  type: 'RgfaTabixAdapter',
  uri: 'g',
  coarse: { uri: 'g.fold10000', foldBelowBp: 10_000 },
})
const walks = track('walks', { type: 'WalkTabixSyntenyAdapter', uri: 'w' })
const genes = track('genes', { type: 'Gff3TabixAdapter', uri: 'genes' })

test('graph tracks are offered, those drawing at any zoom first, and other tracks are not', () => {
  const choices = graphTrackChoices([walks, genes, overview])
  expect(choices.map(c => c.trackId)).toEqual(['overview', 'walks'])
  expect(choices[0]!.reach).toBe('Any zoom: a coarse graph when zoomed out')
  expect(choices[1]!.reach).toBe('Zoomed in: under 5 Mb · haplotype walks')
})

test('a tier with no handover is no coarse tier', () => {
  const bare = track('bare', { type: 'RgfaTabixAdapter', uri: 'g', coarse: {} })
  expect(graphTrackChoices([bare])[0]!.anyZoom).toBe(false)
})

test('a graph track names the assembly it is cut on, its first', () => {
  const lanes = track('lanes', { type: 'WalkTabixSyntenyAdapter', uri: 'w' }, [
    'hg38',
    'HG002.1',
  ])
  expect(graphTrackChoices([lanes])[0]!.assembly).toBe('hg38')
})

test('the region a lone linear view on the assembly shows is the default, and two such views name none', () => {
  const view = (visibleLocStrings: string, assemblyNames = ['hg38']) => ({
    type: 'LinearGenomeView',
    assemblyNames,
    visibleLocStrings,
  })
  expect(
    viewedLocString([view('chr1:1-100'), view('x:1-5', ['mm10'])], 'hg38'),
  ).toBe('chr1:1-100')
  expect(viewedLocString([view('chr1:1-100'), view('chr2:1-5')], 'hg38')).toBe(
    undefined,
  )
})

test('a first look is a whole contig where a coarse tier draws it, else its first 20 kb', () => {
  const [anyZoom, zoomedIn] = graphTrackChoices([overview, walks])
  const contig = { refName: 'chr1', start: 0, end: 248_956_422 }
  expect(firstLookLocString(anyZoom!, contig)).toBe('chr1')
  expect(firstLookLocString(zoomedIn!, contig)).toBe('chr1:1-20,000')
  expect(
    firstLookLocString(zoomedIn!, { refName: 'chrM', start: 0, end: 16_569 }),
  ).toBe('chrM:1-16,569')
})
