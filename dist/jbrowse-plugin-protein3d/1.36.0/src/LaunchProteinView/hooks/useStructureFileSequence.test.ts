// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

import useStructureFileSequence from './useStructureFileSequence'

import type * as P2sMapper from 'p2s_mapper'

let reads = 0
let fileReads = 0

vi.mock('../utils/readStructureFile', () => ({
  readStructureFile: async (file: File) => {
    fileReads++
    return file.text()
  },
}))

vi.mock('../../ProteinView/withTemporaryMolstarPlugin', () => ({
  withTemporaryMolstarPlugin: (fn: (plugin: unknown) => unknown) =>
    fn({ builders: { structure: { createModel: (t: unknown) => t } } }),
}))
vi.mock('../../ProteinView/structurePipeline', () => ({
  parseStructureTrajectory: async ({
    url,
    data,
  }: {
    url?: string
    data?: string
  }) => {
    reads++
    if (url?.includes('bad')) {
      throw new Error('No model could be read')
    }
    return url ?? data
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

test("a picked file's text is kept for the launch, so it is read once", async () => {
  const file = new File(['data_1ABC\n'], '1abc.cif')
  const { result } = renderHook(() => useStructureFileSequence({ file }))
  await waitFor(() => {
    expect(result.current.textLength).toBe(10)
  })
  expect(result.current.sequences).toEqual(['data_1ABC\n'])
  expect(await result.current.readText?.()).toBe('data_1ABC\n')
  expect(fileReads).toBe(1)
})
