import { expect, test } from 'vitest'

import { genomeTrackAsk, withTimeout } from './variantEffectSource'

import type { FeatureFilter } from './featureFields'

test('times out a task that ignores the signal, as an assembly load or an RPC does', async () => {
  let aborted = false
  await expect(
    withTimeout(signal => {
      signal.addEventListener('abort', () => {
        aborted = true
      })
      return new Promise(() => {})
    }, 20),
  ).rejects.toThrow('no answer in 0.02 s')
  expect(aborted).toBe(true)
})

test('answers with the task when it settles in time', async () => {
  await expect(withTimeout(async () => 'values', 1000)).resolves.toBe('values')
})

function keyOf(filter?: FeatureFilter) {
  const asked = genomeTrackAsk({
    trackId: 'dog10k',
    trackName: 'Dog10K',
    stat: 'count',
    filter,
    feature: { uniqueId: 'sod1', refName: 'chr31', start: 0, end: 10 },
    assemblyName: 'canFam4',
  })
  return asked.status === 'ready' ? asked.request.key : undefined
}

test('a filter names a different request, so a changed one is fetched afresh', () => {
  const passing = keyOf([{ field: 'FILTER', equal: 'PASS' }])
  expect(passing).toBeDefined()
  expect(passing).not.toBe(keyOf())
  expect(passing).toBe(keyOf([{ field: 'FILTER', equal: 'PASS' }]))
})
