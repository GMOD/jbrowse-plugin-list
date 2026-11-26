import React from 'react'

import { Typography } from '@mui/material'
import { observer } from 'mobx-react'

import { uncodedTranscript } from '../codingFeature'
import { getTranscriptDisplayName } from '../utils/util'

import type { Feature } from '@jbrowse/core/util'

const UncodedTranscriptNotice = observer(function UncodedTranscriptNotice({
  feature,
  preferredTranscriptId,
  selectedTranscript,
}: {
  feature: Feature
  preferredTranscriptId?: string
  selectedTranscript?: Feature
}) {
  const clicked = uncodedTranscript(feature, preferredTranscriptId)
  return clicked && selectedTranscript ? (
    <Typography
      variant="caption"
      color="textSecondary"
      data-testid="uncoded-transcript-notice"
    >
      {getTranscriptDisplayName(clicked) || clicked.id()} has no coding
      sequence; using{' '}
      {getTranscriptDisplayName(selectedTranscript) || selectedTranscript.id()}
    </Typography>
  ) : null
})

export default UncodedTranscriptNotice
