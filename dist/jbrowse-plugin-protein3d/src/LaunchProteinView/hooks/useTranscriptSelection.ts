import { useMemo, useState } from 'react'

import { selectBestTranscript } from '../utils/util'

import type { Feature } from '@jbrowse/core/util'

export default function useTranscriptSelection({
  options,
  isoformSequences,
  structureSequence,
  resetKey,
}: {
  options: Feature[]
  isoformSequences?: Record<string, { feature: Feature; seq: string }>
  structureSequence?: string
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

  const autoSelection = useMemo(
    () =>
      isoformSequences !== undefined
        ? selectBestTranscript({
            options,
            isoformSequences,
            structureSequence,
          })?.id()
        : undefined,
    [options, structureSequence, isoformSequences],
  )

  return { userSelection: userSelection ?? autoSelection, setUserSelection }
}
