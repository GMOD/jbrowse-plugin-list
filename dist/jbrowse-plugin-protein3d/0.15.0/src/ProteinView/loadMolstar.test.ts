import { expect, test, vi } from 'vitest'

import loadMolstar from './loadMolstar'

let attempts = 0
vi.mock('./molstarExports', () => {
  attempts++
  if (attempts === 1) {
    throw new Error('chunk failed to load')
  }
  return { loaded: true }
})

// The UMD build already forgot a failed chunk load; the npm build cached the
// rejection, so one dropped request broke every protein view until a reload.
test('a failed load is retried by the next caller', async () => {
  await expect(loadMolstar()).rejects.toThrow()
  await expect(loadMolstar()).resolves.toMatchObject({ loaded: true })
})
