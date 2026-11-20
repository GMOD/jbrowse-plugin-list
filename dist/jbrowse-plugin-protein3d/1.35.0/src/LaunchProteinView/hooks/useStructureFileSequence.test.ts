// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

import useStructureFileSequence from './useStructureFileSequence'

import type * as P2sMapper from 'p2s_mapper'

let reads = 0

vi.mock('../../ProteinView/withTemporaryMolstarPlugin', () => ({
  withTemporaryMolstarPlugin: (fn: (plugin: unknown) => unknown) =>
    fn({ builders: { structure: { createModel: (t: unknown) => t } } }),
}))
vi.mock('../../ProteinView/structurePipeline', () => ({
  parseStructureTrajectory: async ({ url }: { url: string }) => {
    reads++
    if (url.includes('bad')) {
      throw new Error('No model could be read')
    }
    return url
  },
}))
vi.mock('p2s_mapper', async importActual => ({
  ...(await importActual<typeof P2sMapper>()),
  extractStructureSequences: (url: string) => [url],
}))

// keepPreviousData used to hand back the last structure's chains while the
// next was read and after it failed, so the isoforms were ranked, and the
// launch defaulted, against a structure the user had moved on from
test('another structure never answers with the last one, and a failure is not retried', async () => {
  const { result, rerender } = renderHook(
    ({ url }) => useStructureFileSequence({ url }),
    { initialProps: { url: 'a.cif' } },
  )
  await waitFor(() => {
    expect(result.current.sequences).toEqual(['a.cif'])
  })
  rerender({ url: 'bad.cif' })
  expect(result.current.sequences).toBeUndefined()
  await waitFor(() => {
    expect(result.current.error).toBeDefined()
  })
  expect(result.current.sequences).toBeUndefined()
  expect(reads).toBe(2)
})
