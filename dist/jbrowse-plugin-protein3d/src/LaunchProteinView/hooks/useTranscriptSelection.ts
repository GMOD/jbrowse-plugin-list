import { useMemo, useState } from 'react'

import { selectBestTranscript } from '../utils/util'

import type { Feature } from '@jbrowse/core/util'

export default function useTranscriptSelection({
  options,
  isoformSequences,
  structureSequence,
}: {
  options: Feature[]
  isoformSequences?: Record<string, { feature: Feature; seq: string }>
  structureSequence?: string
}) {
  const [userSelection, setUserSelection] = useState<string>()

  // SYNC: src/LaunchProteinView/hooks/useAlphaFoldDBSearch.ts (same pattern)
  // Auto-select synchronously to avoid render gap
  const autoSelection = useMemo(() => {
    if (isoformSequences !== undefined && userSelection === undefined) {
      return selectBestTranscript({
        options,
        isoformSequences,
        structureSequence,
      })?.id()
    }
    return undefined
  }, [options, structureSequence, isoformSequences, userSelection])

  const effectiveSelection = userSelection ?? autoSelection

  return { userSelection: effectiveSelection, setUserSelection }
}
