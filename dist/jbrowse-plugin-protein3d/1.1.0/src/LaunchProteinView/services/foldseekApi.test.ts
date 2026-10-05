import { afterEach, expect, test, vi } from 'vitest'

import {
  FOLDSEEK_MAX_RESIDUES,
  foldseekLengthProblem,
  predict3Di,
  submitFoldseekSearch,
  waitForFoldseekResults,
} from './foldseekApi'

afterEach(() => {
  vi.unstubAllGlobals()
})

// Measured 2026-09-24: 3di.foldseek.com answers 1200 residues and refuses 1201
// with a 400; past ~8000 its nginx returns a 414 instead.
test('the limit counts residues after cleaning, not raw characters', () => {
  const atLimit = 'A'.repeat(FOLDSEEK_MAX_RESIDUES)
  expect(foldseekLengthProblem(`>header\n${atLimit}*\n  `)).toBeUndefined()
  expect(foldseekLengthProblem(`${atLimit}A`)).toContain('1,201')
})

test('an over-long sequence never reaches the predictor', async () => {
  const fetchSpy = vi.fn()
  vi.stubGlobal('fetch', fetchSpy)
  await expect(
    predict3Di({ aaSequence: 'A'.repeat(FOLDSEEK_MAX_RESIDUES + 1) }),
  ).rejects.toThrow(/at most 1,200 residues/)
  expect(fetchSpy).not.toHaveBeenCalled()
})

test('a refusal without a ticket id is reported, not polled', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ status: 'RATELIMIT' }))),
  )
  await expect(
    submitFoldseekSearch({
      aaSequence: 'MK',
      di3Sequence: 'DD',
      databases: [],
    }),
  ).rejects.toThrow(/did not accept the search: {"status":"RATELIMIT"}/)
})

test('an accepted search returns its ticket', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify({ id: 'abc', status: 'PENDING' })),
    ),
  )
  expect(
    await submitFoldseekSearch({
      aaSequence: 'MK',
      di3Sequence: 'DD',
      databases: [],
    }),
  ).toEqual({ id: 'abc', status: 'PENDING' })
})

test('a rate-limited poll is reported, not waited out', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify([{ status: 'RATELIMIT' }]))),
  )
  await expect(waitForFoldseekResults({ ticketId: 'abc' })).rejects.toThrow(
    /failed: RATELIMIT/,
  )
})
