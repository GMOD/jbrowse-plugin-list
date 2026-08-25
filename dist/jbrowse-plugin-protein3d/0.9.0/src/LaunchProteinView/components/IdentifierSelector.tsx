import React, { useState } from 'react'

import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'

import { getDbIdLabel } from '../utils/util'

interface IdentifierSelectorProps {
  recognizedIds: string[]
  geneName?: string
  selectedId: string
  onSelectedIdChange: (id: string) => void
}

export default function IdentifierSelector({
  recognizedIds,
  geneName,
  selectedId,
  onSelectedIdChange,
}: IdentifierSelectorProps) {
  const [expanded, setExpanded] = useState(false)

  // Build list of selectable options
  const options: { value: string; label: string }[] = [
    { value: 'auto', label: 'Auto (try all)' },
    ...recognizedIds.map(id => ({ value: id, label: getDbIdLabel(id) })),
  ]

  if (geneName) {
    options.push({
      value: `gene:${geneName}`,
      label: `${geneName} (gene name)`,
    })
  }

  if (recognizedIds.length === 0 && !geneName) {
    return null
  }

  if (!expanded) {
    return (
      <Button
        size="small"
        variant="text"
        onClick={() => {
          setExpanded(true)
        }}
      >
        Choose identifier to query...
      </Button>
    )
  }

  return (
    <FormControl size="small">
      <InputLabel>Query UniProt by</InputLabel>
      <Select
        value={selectedId}
        label="Query UniProt by"
        onChange={e => {
          onSelectedIdChange(e.target.value)
        }}
      >
        {options.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
