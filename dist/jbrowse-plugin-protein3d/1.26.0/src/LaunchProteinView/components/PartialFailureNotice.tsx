import React from 'react'

import { Typography } from '@mui/material'

// What came back short of what was asked for: identifiers a UniProt outage
// swallowed, transcripts with no protein sequence. Not an error — the dialog
// still works — but not silence either, which is what makes 18 isoforms of a
// 20-isoform gene read as the whole gene.
export default function PartialFailureNotice({
  message,
}: {
  message?: string
}) {
  return message ? (
    <Typography variant="body2" color="warning.main">
      {message}
    </Typography>
  ) : null
}
