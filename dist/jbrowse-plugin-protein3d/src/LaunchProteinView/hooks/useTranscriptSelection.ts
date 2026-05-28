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

  const autoSelection = useMemo(
    () =>
      isoformSequences !== undefined
        ? selectBestTranscript({ options, isoformSequences, structureSequence })?.id()
        : undefined,
    [options, structureSequence, isoformSequences],
  )

  const effectiveSelection = userSelection ?? autoSelection

  return { userSelection: effectiveSelection, setUserSelection }
}
