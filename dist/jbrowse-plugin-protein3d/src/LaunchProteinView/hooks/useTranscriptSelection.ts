import { useEffect, useState } from 'react'

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

  useEffect(() => {
    if (isoformSequences !== undefined && userSelection === undefined) {
      const best = selectBestTranscript({
        options,
        isoformSequences,
        structureSequence,
      })
      setUserSelection(best?.id())
    }
  }, [options, structureSequence, isoformSequences, userSelection])

  return { userSelection, setUserSelection }
}
