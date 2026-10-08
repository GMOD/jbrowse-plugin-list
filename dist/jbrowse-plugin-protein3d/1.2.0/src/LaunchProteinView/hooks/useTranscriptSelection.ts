import { useState } from 'react'

import { rankableIsoforms } from '../utils/util'

import type { IsoformSequences } from '../utils/util'
import type { Feature } from '@jbrowse/core/util'
import type { ClassifiedIsoforms } from 'p2s_mapper'

/**
 * The isoform the user right-clicked when it translates, else the one whose
 * protein best matches the structure, which is unknown until the worker has
 * ranked them. The first needs no ranking, so Launch does not wait on one.
 */
export function defaultTranscriptId({
  options,
  isoformSequences,
  ranking,
  preferredTranscriptId,
}: {
  options: Feature[]
  isoformSequences: IsoformSequences
  ranking?: ClassifiedIsoforms
  preferredTranscriptId?: string
}) {
  return rankableIsoforms(options, isoformSequences).some(
    i => i.id === preferredTranscriptId && i.seq,
  )
    ? preferredTranscriptId
    : ranking && (ranking.matches[0] ?? ranking.nonMatches[0])?.id
}

export default function useTranscriptSelection({
  options,
  isoformSequences,
  ranking,
  preferredTranscriptId,
  resetKey,
}: {
  options: Feature[]
  isoformSequences?: IsoformSequences
  ranking?: ClassifiedIsoforms
  preferredTranscriptId?: string
  // When this value changes the manual selection is cleared, falling back to
  // the recomputed auto-selection (e.g. after the user picks a different
  // UniProt entry, which yields a different structure).
  resetKey?: string
}) {
  const [userSelection, setUserSelection] = useState<string>()
  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey)
    setUserSelection(undefined)
  }

  const autoSelection =
    isoformSequences !== undefined
      ? defaultTranscriptId({
          options,
          isoformSequences,
          ranking,
          preferredTranscriptId,
        })
      : undefined

  return { userSelection: userSelection ?? autoSelection, setUserSelection }
}
