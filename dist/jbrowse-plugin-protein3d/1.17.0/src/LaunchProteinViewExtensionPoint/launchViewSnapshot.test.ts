import { expect, test } from 'vitest'

import { launchViewSettings } from './launchProteinView'

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
