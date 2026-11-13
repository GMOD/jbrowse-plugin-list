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

// A cached rejection would break every protein view until a reload after one
// dropped chunk request.
test('a failed load is retried by the next caller', async () => {
  await expect(loadMolstar()).rejects.toThrow()
  await expect(loadMolstar()).resolves.toMatchObject({ loaded: true })
})
