import { expect, test } from 'vitest'

import { timeout } from './fetchUtils'

test('timeout resolves after the delay', async () => {
  await expect(timeout(1)).resolves.toBeUndefined()
})

test('timeout rejects immediately if the signal is already aborted', async () => {
  const controller = new AbortController()
  controller.abort()
  await expect(timeout(10_000, controller.signal)).rejects.toThrow()
})

test('timeout rejects when the signal aborts mid-wait', async () => {
  const controller = new AbortController()
  const p = timeout(10_000, controller.signal)
  controller.abort()
  await expect(p).rejects.toThrow()
})

test('timeout preserves a custom Error abort reason', async () => {
  const controller = new AbortController()
  const reason = new Error('dialog closed')
  controller.abort(reason)
  await expect(timeout(10_000, controller.signal)).rejects.toBe(reason)
})
