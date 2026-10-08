import { expect, test } from 'vitest'

import {
  COMPACT_TRACK_HEIGHT,
  MAX_TRACK_HEIGHT,
  MIN_TRACK_HEIGHT,
  NORMAL_TRACK_HEIGHT,
  trackHeightOf,
} from './constants'

// Only the drag clamped, so a spec's `trackHeight: -5` drew a negative lane
test.each([
  [-5, MIN_TRACK_HEIGHT],
  [0, MIN_TRACK_HEIGHT],
  [500, MAX_TRACK_HEIGHT],
  [14, 14],
])('a declared track height of %d reads as %d', (trackHeight, expected) => {
  expect(trackHeightOf({ trackHeight, compactTracks: true })).toBe(expected)
})

test('an unset track height follows compactTracks', () => {
  expect(trackHeightOf({ compactTracks: false })).toBe(NORMAL_TRACK_HEIGHT)
  expect(trackHeightOf({ compactTracks: true })).toBe(COMPACT_TRACK_HEIGHT)
})
