import { expect, test } from 'vitest'

import { withTimeout } from './variantEffectSource'

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
