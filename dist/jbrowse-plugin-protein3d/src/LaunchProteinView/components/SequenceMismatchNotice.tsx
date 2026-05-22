import React from 'react'

import { Typography } from '@mui/material'

import AlignmentSettingsButton from './AlignmentSettingsButton'
import {
  ALIGNMENT_ALGORITHM_LABELS,
  type AlignmentAlgorithm,
} from '../../ProteinView/types'

export default function SequenceMismatchNotice({
  alignmentAlgorithm,
  onAlignmentAlgorithmChange,
}: {
  alignmentAlgorithm: AlignmentAlgorithm
  onAlignmentAlgorithmChange: (algorithm: AlignmentAlgorithm) => void
}) {
  return (
    <Typography
      variant="body2"
      sx={{ mr: 2, display: 'flex', alignItems: 'center' }}
    >
      Transcript and structure sequences differ, will run{' '}
      {ALIGNMENT_ALGORITHM_LABELS[alignmentAlgorithm] ?? alignmentAlgorithm}{' '}
      alignment
      <AlignmentSettingsButton
        value={alignmentAlgorithm}
        onChange={onAlignmentAlgorithmChange}
      />
    </Typography>
  )
}
