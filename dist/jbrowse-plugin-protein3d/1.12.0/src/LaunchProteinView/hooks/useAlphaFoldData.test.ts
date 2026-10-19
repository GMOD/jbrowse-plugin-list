// @vitest-environment jsdom
import { SimpleFeature } from '@jbrowse/core/util'
import { renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

import useAlphaFoldData from './useAlphaFoldData'

import type * as P2sMapper from 'p2s_mapper'

vi.mock('./useIsoformProteinSequences', () => ({
  default: () => ({ isoformSequences: {} }),
}))
vi.mock('p2s_mapper', async importActual => ({
  ...(await importActual<typeof P2sMapper>()),
  fetchAlphaFoldModels: async (accession: string) => [
    {
      accession,
      url: `https://alphafold.ebi.ac.uk/files/AF-${accession}-F1-model_v6.cif`,
      sequence: 'MEEP',
    },
  ],
}))

const feature = new SimpleFeature({
  uniqueId: 'f',
  refName: 'chr17',
  start: 0,
  end: 10,
})

// SWR's keepPreviousData returns the last key's data after the key turns
// null, and the tab's Launch read it as this accession's structure
test('clearing the accession clears the model', async () => {
  const initialProps: { uniprotId?: string } = { uniprotId: 'P04637' }
  const { result, rerender } = renderHook(
    ({ uniprotId }) => useAlphaFoldData({ uniprotId, feature }),
    { initialProps },
  )
  await waitFor(() => {
    expect(result.current.model?.accession).toBe('P04637')
  })
  rerender({ uniprotId: undefined })
  expect(result.current.model).toBeUndefined()
})
