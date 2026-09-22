import React from 'react'

import { Typography } from '@mui/material'
import { uniprotEntryUrl } from 'p2s_mapper'

import ExternalLink from '../../components/ExternalLink'

export default function AlphaFoldDBSearchStatus({
  uniprotId,
  url,
}: {
  uniprotId: string
  url?: string
}) {
  return (
    <div>
      <Typography>
        UniProt link:{' '}
        <ExternalLink href={uniprotEntryUrl(uniprotId)}>
          {uniprotId}
        </ExternalLink>
      </Typography>
      <Typography>
        AlphaFoldDB link: <ExternalLink href={url}>{url}</ExternalLink>
      </Typography>
    </div>
  )
}
