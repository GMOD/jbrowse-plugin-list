import { expect, test } from 'vitest'

import { launchViewSettings, withGeneModel } from './launchProteinView'
import { normalizeLaunch } from './normalizeLaunch'

test('every view setting a launch names reaches the view', () => {
  const snapshot = launchViewSettings({
    displayName: 'p53',
    height: 400,
    showControls: true,
    showAlignment: false,
    showHighlight: true,
    showProteinTracks: false,
    compactTracks: false,
    showAllFeatureTracks: true,
    zoomToBaseLevel: false,
    autoScrollAlignment: true,
  })
  expect(snapshot).toMatchObject({
    displayName: 'p53',
    height: 400,
    showControls: true,
    showAlignment: false,
    showHighlight: true,
    showProteinTracks: false,
    compactTracks: false,
    showAllFeatureTracks: true,
    zoomToBaseLevel: false,
    autoScrollAlignment: true,
  })
})

test('an old colorScheme name lifts to a color object, an unknown one to the default', () => {
  expect(launchViewSettings({ colorScheme: 'alphamissense' }).color).toEqual({
    field: 'alphaMissense',
  })
  expect(launchViewSettings({ colorScheme: 'no-such-scheme' }).color).toEqual(
    {},
  )
  expect(
    launchViewSettings({ color: { field: 'domain' }, colorScheme: 'clinvar' })
      .color,
  ).toEqual({ field: 'domain' })
  const bare = launchViewSettings({})
  expect(bare.color).toBeUndefined()
  expect(bare.alignmentAlgorithm).toBeUndefined()
})

test('a color object with a member its field cannot take is refused', () => {
  expect(() =>
    launchViewSettings({ color: { field: 'chain', range: ['red'] } }),
  ).toThrow("color.range is refused: chain paints in Mol*'s palette")
})

const isoformModel = {
  url: 'https://alphafold.ebi.ac.uk/files/AF-P04637-4-F1-model_v6.cif',
}

function opened(launch: object) {
  const normalized = normalizeLaunch(launch)
  return 'error' in normalized ? [] : withGeneModel(normalized, isoformModel)
}

test('a gene launch with no structure of its own opens the model its lookup picked', () => {
  expect(
    opened({ gene: 'TP53', transcriptId: 'NM_001126118.2' }),
  ).toMatchObject([isoformModel])
})

// Each entry names its own source, so the uniprotId entry is left to the
// loader, which opens that accession's model: the canonical AF-P04637-F1
test('a gene launch with structures opens what each entry names, not the gene model', () => {
  expect(
    opened({
      gene: 'TP53',
      transcriptId: 'NM_001126118.2',
      structures: [{ uniprotId: 'P04637' }, { pdbId: '1TUP' }],
    }),
  ).toEqual([
    expect.objectContaining({ uniprotId: 'P04637', url: undefined }),
    expect.objectContaining({
      pdbId: '1TUP',
      url: 'https://files.rcsb.org/download/1TUP.cif',
    }),
  ])
})
