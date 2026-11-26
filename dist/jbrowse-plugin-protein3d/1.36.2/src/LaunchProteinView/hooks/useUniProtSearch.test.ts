// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

import useUniProtSearch from './useUniProtSearch'

import type * as P2sMapper from 'p2s_mapper'

vi.mock('p2s_mapper', async importActual => ({
  ...(await importActual<typeof P2sMapper>()),
  searchUniProtEntries: async ({ geneName }: { geneName?: string }) => {
    if (geneName === 'OFFLINE') {
      throw new Error('UniProt did not answer')
    }
    return {
      entries: [{ accession: 'P04637', reviewed: true }],
      attemptedCount: 2,
      failedCount: 1,
    }
  },
}))

test("a failed search lists none of the previous query's entries", async () => {
  const { result, rerender } = renderHook(
    ({ selectedQueryId }) => useUniProtSearch({ selectedQueryId }),
    { initialProps: { selectedQueryId: 'gene:TP53' } },
  )
  await waitFor(() => {
    expect(result.current.entries.map(e => e.accession)).toEqual(['P04637'])
  })
  expect(result.current.partialFailure).toBe(
    'UniProt lookup failed for 1 of 2 identifiers',
  )

  rerender({ selectedQueryId: 'gene:OFFLINE' })
  await waitFor(() => {
    expect(`${result.current.error}`).toMatch(/did not answer/)
  })
  expect(result.current.entries).toEqual([])
  expect(result.current.partialFailure).toBeUndefined()
})
