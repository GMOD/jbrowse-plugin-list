// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

import {
  rankAlphaFoldComplexes,
  useAlphaFoldComplexModel,
  useAlphaFoldComplexes,
} from './useAlphaFoldComplexes'

import type * as P2sMapper from 'p2s_mapper'

const complex = (entity: string, homomer: boolean, iptm?: number) => ({
  entity,
  homomer,
  iptm,
  members: [{ accession: 'P09211', copies: homomer ? 2 : 1 }],
})

const asked: string[] = []

vi.mock('p2s_mapper', async importActual => ({
  ...(await importActual<typeof P2sMapper>()),
  fetchAlphaFoldComplexes: async (accession: string) => {
    asked.push(accession)
    return [complex('AF-1', false, 0.5), complex('AF-2', true, 0.9)]
  },
  fetchAlphaFoldComplexModel: async (entity: string) =>
    entity === 'AF-404'
      ? undefined
      : { entity, url: `https://alphafold.ebi.ac.uk/files/${entity}.cif` },
}))

test('homomers come first, then the most confident interface', () => {
  expect(
    rankAlphaFoldComplexes([
      complex('weak', false, 0.4),
      complex('none', false),
      complex('homo', true, 0.7),
      complex('strong', false, 0.9),
    ]).map(c => c.entity),
  ).toEqual(['homo', 'strong', 'weak', 'none'])
})

test("an isoform lists its entry's complexes", async () => {
  const { result } = renderHook(() => useAlphaFoldComplexes('P09211-2'))
  await waitFor(() => {
    expect(result.current.complexes?.map(c => c.entity)).toEqual([
      'AF-2',
      'AF-1',
    ])
  })
  expect(asked).toEqual(['P09211'])
})

test('a complex resolves to its file, and one without files is an error', async () => {
  const { result } = renderHook(
    ({ entity }) => useAlphaFoldComplexModel(entity),
    { initialProps: { entity: 'AF-2' } },
  )
  await waitFor(() => {
    expect(result.current.model?.url).toBe(
      'https://alphafold.ebi.ac.uk/files/AF-2.cif',
    )
  })
  const missing = renderHook(() => useAlphaFoldComplexModel('AF-404'))
  await waitFor(() => {
    expect(`${missing.result.current.error}`).toMatch(
      /no files for complex AF-404/,
    )
  })
})
