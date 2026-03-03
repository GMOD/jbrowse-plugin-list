import React, { useState } from 'react'

import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'

import { getDatabaseTypeForId } from '../utils/util'

interface IdentifierSelectorProps {
  recognizedIds: string[]
  uniprotId?: string
  geneName?: string
  selectedId: string
  onSelectedIdChange: (id: string) => void
}

function getIdLabel(id: string): string {
  const dbType = getDatabaseTypeForId(id)
  if (dbType === 'refseq') {
    if (id.startsWith('NM_') || id.startsWith('XM_')) {
      return `${id} (RefSeq mRNA)`
    }
    if (id.startsWith('NR_') || id.startsWith('XR_')) {
      return `${id} (RefSeq ncRNA)`
    }
    if (id.startsWith('NP_') || id.startsWith('XP_')) {
      return `${id} (RefSeq protein)`
    }
    return `${id} (RefSeq)`
  }
  if (dbType === 'ensembl') {
    if (id.includes('G')) {
      return `${id} (Ensembl gene)`
    }
    if (id.includes('T')) {
      return `${id} (Ensembl transcript)`
    }
    if (id.includes('P')) {
      return `${id} (Ensembl protein)`
    }
    return `${id} (Ensembl)`
  }
  if (dbType === 'hgnc') {
    return `${id} (HGNC)`
  }
  if (dbType === 'ccds') {
    return `${id} (CCDS)`
  }
  return id
}

export default function IdentifierSelector({
  recognizedIds,
  uniprotId,
  geneName,
  selectedId,
  onSelectedIdChange,
}: IdentifierSelectorProps) {
  const [expanded, setExpanded] = useState(false)

  // Build list of selectable options
  const options: { value: string; label: string }[] = [
    { value: 'auto', label: 'Auto (try all)' },
    ...recognizedIds.map(id => ({ value: id, label: getIdLabel(id) })),
  ]

  if (uniprotId) {
    options.push({
      value: `uniprot:${uniprotId}`,
      label: `${uniprotId} (UniProt)`,
    })
  }

  if (geneName) {
    options.push({
      value: `gene:${geneName}`,
      label: `${geneName} (gene name)`,
    })
  }

  if (recognizedIds.length === 0 && !uniprotId && !geneName) {
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
