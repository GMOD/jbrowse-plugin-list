import { useMemo } from 'react'

import { getPdbStructureUrl } from 'p2s_mapper'

import { errorHoldsLaunch } from '../utils/launchHelpers'
import { useAlphaFoldComplexModel } from './useAlphaFoldComplexes'
import usePdbEntry from './usePdbEntry'
import useStructureFileSequence from './useStructureFileSequence'
import useTranscriptIsoformSelection from './useTranscriptIsoformSelection'

import type { LaunchAlphaFoldModel } from '../resolveGeneLaunch'
import type { StructureSource } from '../utils/launchViewUtils'
import type { Feature } from '@jbrowse/core/util'

/** A structure the launch opens, as the list names it */
export type ListedStructure =
  | { key: string; kind: 'alphafold'; model: LaunchAlphaFoldModel }
  | { key: string; kind: 'pdb'; pdbId: string }
  | { key: string; kind: 'complex'; entity: string }
  | { key: string; kind: 'url'; url: string; uniprotId?: string }

/** A listed structure, or a file the user picked, which opens as the text
 * read from it */
export type LaunchStructure =
  | ListedStructure
  | { key: string; kind: 'file'; file: File }

export function structureSource(structure: ListedStructure): StructureSource {
  return structure.kind === 'alphafold'
    ? { url: structure.model.url }
    : structure.kind === 'pdb'
      ? { url: getPdbStructureUrl(structure.pdbId) }
      : structure.kind === 'url'
        ? { url: structure.url, uniprotId: structure.uniprotId }
        : { alphaFoldComplexId: structure.entity }
}

/**
 * The transcript a launch maps every structure through, ranked against the
 * first structure: the one the rest are superposed onto. A complex is ranked by
 * the gene's own chain, a PDB entry by whichever of its chains the transcript
 * fits best. The ranking follows the first structure as it changes, and a
 * transcript picked by hand lasts until it does.
 */
export default function useStructureLaunch({
  structures,
  uniprotId,
  feature,
  view,
  preferredTranscriptId,
}: {
  structures: readonly LaunchStructure[]
  uniprotId?: string
  feature: Feature
  view?: { assemblyNames?: string[] }
  preferredTranscriptId?: string
}) {
  const pivot = structures[0]
  const pdb = usePdbEntry(pivot?.kind === 'pdb' ? pivot.pdbId : undefined)
  const complex = useAlphaFoldComplexModel(
    pivot?.kind === 'complex' ? pivot.entity : undefined,
  )
  const file = useStructureFileSequence({
    url: pivot?.kind === 'url' ? pivot.url : undefined,
    file: pivot?.kind === 'file' ? pivot.file : undefined,
  })
  const readsFile = pivot?.kind === 'url' || pivot?.kind === 'file'
  const entry = uniprotId?.replace(/-\d+$/, '')
  const complexChains = complex.model?.chains
  const ownChain = complexChains?.find(c => c.accession === entry)
  const alphaFoldSequence =
    pivot?.kind === 'alphafold' ? pivot.model.sequence : undefined
  const pdbSequences = pdb.entry?.proteinSequences
  const fileSequences = file.sequences

  // a stable array, or the isoform picker realigns on every render
  const structureSequences = useMemo(
    () =>
      pivot?.kind === 'alphafold'
        ? alphaFoldSequence
          ? [alphaFoldSequence]
          : undefined
        : pivot?.kind === 'pdb'
          ? pdbSequences
          : readsFile
            ? fileSequences
            : ownChain
              ? [ownChain.sequence]
              : complexChains?.map(c => c.sequence),
    [
      pivot?.kind,
      readsFile,
      alphaFoldSequence,
      pdbSequences,
      fileSequences,
      ownChain,
      complexChains,
    ],
  )

  const selection = useTranscriptIsoformSelection({
    feature,
    view,
    structureSequences,
    preferredTranscriptId,
    resetKey: pivot?.key,
  })

  // Until the first structure's chains arrive the ranking has none and orders
  // the isoforms by length, so a launch that takes the ranked default waits.
  // The right-clicked isoform needs no ranking and launches at once. An entry
  // RCSB cannot describe stops holding the launch.
  const awaitsChains =
    selection.selectedTranscriptId !== preferredTranscriptId &&
    ((pdb.isValidating && !pdb.error) || complex.isLoading || file.isLoading)
  const loadingStatuses = [
    selection.isLoading && 'Loading protein sequences from transcript isoforms',
    selection.isRanking && 'Aligning isoforms to the structure',
    awaitsChains &&
      (pivot?.kind === 'pdb'
        ? 'Reading the chains of the entry from RCSB'
        : readsFile
          ? 'Reading residues from the structure'
          : 'Asking AlphaFold DB for the complex'),
  ].filter(s => typeof s === 'string')
  const isLoading = loadingStatuses.length > 0
  // errors wait for loading to finish, so a lookup in flight doesn't flash one
  const error = isLoading
    ? undefined
    : (selection.error ?? complex.error ?? file.error)

  return {
    ...selection,
    loadingStatuses,
    isLoading,
    error,
    failed: errorHoldsLaunch({
      error,
      rankingError: selection.rankingError,
      selectedTranscriptId: selection.selectedTranscriptId,
      preferredTranscriptId,
    }),
    /** characters of the picked file's text, once read for its chains */
    fileTextLength: file.textLength,
    /** the picked file's text, as read for its chains */
    readFileText: file.readText,
  }
}
