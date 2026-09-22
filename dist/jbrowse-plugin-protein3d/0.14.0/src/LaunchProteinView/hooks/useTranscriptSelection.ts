import { useState } from 'react'

import { selectBestTranscript } from 'p2s_mapper'

import { rankableIsoforms } from '../utils/util'

import type { IsoformSequences } from '../utils/util'
import type { Feature } from '@jbrowse/core/util'

/**
 * The isoform the user right-clicked when it translates, else the one whose
 * protein best matches the structure.
 */
export function defaultTranscriptId({
  options,
  isoformSequences,
  structureSequence,
  preferredTranscriptId,
}: {
  options: Feature[]
  isoformSequences: IsoformSequences
  structureSequence?: string
  preferredTranscriptId?: string
}) {
  const isoforms = rankableIsoforms(options, isoformSequences)
  return isoforms.some(i => i.id === preferredTranscriptId && i.seq)
    ? preferredTranscriptId
    : selectBestTranscript({ isoforms, structureSequence })
}

export default function useTranscriptSelection({
  options,
  isoformSequences,
  structureSequence,
  preferredTranscriptId,
  resetKey,
}: {
  options: Feature[]
  isoformSequences?: IsoformSequences
  structureSequence?: string
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
          structureSequence,
          preferredTranscriptId,
        })
      : undefined

  return { userSelection: userSelection ?? autoSelection, setUserSelection }
}
