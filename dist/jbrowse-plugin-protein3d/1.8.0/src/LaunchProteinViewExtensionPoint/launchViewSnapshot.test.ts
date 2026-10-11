import { expect, test } from 'vitest'

import { launchViewSnapshot } from './index'

test('every view setting a launch names reaches the snapshot', () => {
  const snapshot = launchViewSnapshot(
    {
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
    },
    [{ uniprotId: 'P04637' }],
  )
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

test('untrusted enumeration text is coerced, and absent stays absent', () => {
  expect(
    launchViewSnapshot({ colorScheme: 'no-such-scheme' }, []).colorScheme,
  ).toBe('default')
  const bare = launchViewSnapshot({}, [])
  expect(bare.colorScheme).toBeUndefined()
  expect(bare.alignmentAlgorithm).toBeUndefined()
})
