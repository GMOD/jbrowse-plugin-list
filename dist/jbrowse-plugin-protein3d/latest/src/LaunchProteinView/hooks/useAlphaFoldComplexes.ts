import { useMemo } from 'react'

import { fetchAlphaFoldComplexModel, fetchAlphaFoldComplexes } from 'p2s_mapper'
import useSWR from 'swr'

import { STATIC_SWR_OPTIONS } from './swrOptions'

import type { AlphaFoldComplex } from 'p2s_mapper'

/** Homomers first, as the protein's own assembly, then the partners AlphaFold
 * is surest of how they sit together */
export function rankAlphaFoldComplexes(complexes: readonly AlphaFoldComplex[]) {
  return [...complexes].sort(
    (a, b) =>
      Number(b.homomer) - Number(a.homomer) || (b.iptm ?? 0) - (a.iptm ?? 0),
  )
}

/** Every complex AlphaFold DB predicted with an accession's protein in it.
 * An isoform's complexes are its entry's. */
export function useAlphaFoldComplexes(uniprotId: string | undefined) {
  const entry = uniprotId?.replace(/-\d+$/, '')
  const { data, error, isLoading } = useSWR(
    entry ? (['alphafold-complexes', entry] as const) : null,
    ([, id]) => fetchAlphaFoldComplexes(id),
    STATIC_SWR_OPTIONS,
  )
  const complexes = useMemo(
    () => (data ? rankAlphaFoldComplexes(data) : undefined),
    [data],
  )
  const complexesError: unknown = error
  return { complexes, error: complexesError, isLoading }
}

/** One complex's file and the protein of each of its chains, asked for once
 * the complex is chosen */
export function useAlphaFoldComplexModel(entity: string | undefined) {
  const { data, error, isLoading } = useSWR(
    entity ? (['alphafold-complex-model', entity] as const) : null,
    async ([, id]) => {
      const model = await fetchAlphaFoldComplexModel(id)
      if (!model) {
        throw new Error(`AlphaFold DB has no files for complex ${id}`)
      }
      return model
    },
    STATIC_SWR_OPTIONS,
  )
  const modelError: unknown = error
  return { model: data, error: modelError, isLoading }
}
