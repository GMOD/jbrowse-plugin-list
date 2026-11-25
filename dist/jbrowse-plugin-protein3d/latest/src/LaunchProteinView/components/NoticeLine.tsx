import React from 'react'

import { Link, Typography } from '@mui/material'
import { observer } from 'mobx-react'

import type { TypographyProps } from '@mui/material'

// What came back short of what was asked for: a source that failed,
// identifiers a UniProt outage swallowed, transcripts with no protein
// sequence. Not an error, since the dialog still works, but not silence
// either, which is what makes 18 isoforms of a 20-isoform gene read as the
// whole gene. A request that can be asked again offers Retry.
const NoticeLine = observer(function NoticeLine({
  message,
  onRetry,
  retrying = false,
  color = 'warning.main',
  className,
}: {
  message?: string
  onRetry?: () => void
  retrying?: boolean
  color?: TypographyProps['color']
  className?: string
}) {
  return message ? (
    <Typography variant="body2" color={color} className={className}>
      {message}
      {onRetry ? (
        <>
          {' '}
          {retrying ? (
            'Retrying…'
          ) : (
            <Link
              component="button"
              variant="body2"
              data-testid="notice-retry"
              onClick={onRetry}
              sx={{ verticalAlign: 'baseline' }}
            >
              Retry
            </Link>
          )}
        </>
      ) : null}
    </Typography>
  ) : null
})

export default NoticeLine
