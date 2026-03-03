import React from 'react'

import { Typography } from '@mui/material'

import type { SequenceSearchType } from '../hooks/useAlphaFoldSequenceSearch'

interface SequenceSearchStatusProps {
  isLoading: boolean
  uniprotId?: string
  url?: string
  hasProteinSequence: boolean
  sequenceSearchType: SequenceSearchType
}

export default function SequenceSearchStatus({
  isLoading,
  uniprotId,
  url,
  hasProteinSequence,
  sequenceSearchType,
}: SequenceSearchStatusProps) {
  if (isLoading) {
    return null
  }

  if (!uniprotId && hasProteinSequence) {
    return (
      <Typography color="warning.main">
        No AlphaFold structure found for this sequence (searched by{' '}
        {sequenceSearchType === 'md5' ? 'MD5 checksum' : 'full sequence'})
      </Typography>
    )
  }

  if (uniprotId) {
    return (
      <Typography color="success.main">
        Found AlphaFold structure: {uniprotId}
        {url && (
          <>
            {' '}
            -{' '}
            <a href={url} target="_blank" rel="noreferrer">
              {url}
            </a>
          </>
        )}
      </Typography>
    )
  }

  return null
}
