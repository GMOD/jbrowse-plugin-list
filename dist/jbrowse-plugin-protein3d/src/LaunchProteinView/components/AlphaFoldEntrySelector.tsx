import React from 'react'

import { TextField } from '@mui/material'

import type { AlphaFoldPrediction } from '../hooks/useAlphaFoldUrl'

interface AlphaFoldEntrySelectorProps {
  predictions: AlphaFoldPrediction[]
  selectedEntryIndex: number
  onSelectionChange: (index: number) => void
}

/**
 * Component to select between different AlphaFold structure entries
 */
export default function AlphaFoldEntrySelector({
  predictions,
  selectedEntryIndex,
  onSelectionChange,
}: AlphaFoldEntrySelectorProps) {
  // Only show if there are multiple predictions
  if (predictions.length <= 1) {
    return null
  }

  return (
    <div>
      <TextField
        select
        label="AlphaFold Structure Entry"
        value={selectedEntryIndex}
        helperText="Select an AlphaFold structure entry (isoform)"
        onChange={e => {
          onSelectionChange(Number(e.target.value))
        }}
      >
        {predictions
          .sort((a, b) => a.modelEntityId.length - b.modelEntityId.length)
          .map((prediction, index) => (
            <option key={index} value={index}>
              {prediction.modelEntityId}
            </option>
          ))}
      </TextField>
    </div>
  )
}
