import React from 'react'

import { Typography } from '@mui/material'
import { observer } from 'mobx-react'

import { isoformMatch } from '../utils/isoformMatch'
import { getGeneDisplayName, getTranscriptDisplayName } from '../utils/util'

import type { Feature } from '@jbrowse/core/util'
import type { ClassifiedIsoforms } from 'p2s_mapper'

const IsoformMatchNotice = observer(function IsoformMatchNotice({
  ranking,
  selectedTranscript,
  structureSequence,
  feature,
}: {
  ranking?: ClassifiedIsoforms
  selectedTranscript?: Feature
  structureSequence?: string
  feature: Feature
}) {
  const match = isoformMatch({
    ranking,
    selectedId: selectedTranscript?.id(),
    structureSequence,
  })
  const transcriptName =
    getTranscriptDisplayName(selectedTranscript) || selectedTranscript?.id()
  const geneName = getGeneDisplayName(feature) || 'the gene'
  return match ? (
    <Typography
      variant="body2"
      color={match.lowIdentity ? 'warning.main' : 'textSecondary'}
      data-testid="isoform-match-notice"
      sx={{ mr: 2 }}
    >
      {match.identical} of {match.chainLength} chain residues match{' '}
      {transcriptName};{' '}
      {match.lowIdentity
        ? `this structure may not be ${geneName}'s protein`
        : 'the view aligns the two and maps the residues that match'}
    </Typography>
  ) : null
})

export default IsoformMatchNotice
