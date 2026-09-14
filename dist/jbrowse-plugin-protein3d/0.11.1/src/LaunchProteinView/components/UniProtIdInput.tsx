import React from 'react'

import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'

import ExternalLink from '../../components/ExternalLink'

export type LookupMode = 'auto' | 'manual' | 'feature'

const LOOKUP_MODES: readonly LookupMode[] = ['auto', 'manual', 'feature']

function isLookupMode(value: string): value is LookupMode {
  return LOOKUP_MODES.some(mode => mode === value)
}

interface UniProtIdInputProps {
  lookupMode: LookupMode
  onLookupModeChange: (mode: LookupMode) => void
  manualUniprotId: string
  onManualUniprotIdChange: (id: string) => void
  featureUniprotId?: string
  endContent?: React.ReactNode
}

export default function UniProtIdInput({
  lookupMode,
  onLookupModeChange,
  manualUniprotId,
  onManualUniprotIdChange,
  featureUniprotId,
  endContent,
}: UniProtIdInputProps) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl component="fieldset">
          <RadioGroup
            row
            value={lookupMode}
            onChange={event => {
              if (isLookupMode(event.target.value)) {
                onLookupModeChange(event.target.value)
              }
            }}
          >
            {featureUniprotId && (
              <FormControlLabel
                value="feature"
                control={<Radio />}
                label={`From feature (${featureUniprotId})`}
              />
            )}
            <FormControlLabel
              value="auto"
              control={<Radio />}
              label="Auto-detect using UniProt ID mapping API"
            />
            <FormControlLabel
              value="manual"
              control={<Radio />}
              label="Enter manually"
            />
          </RadioGroup>
        </FormControl>
        {endContent}
      </div>

      {lookupMode === 'manual' && (
        <div>
          <TextField
            label="UniProt ID"
            variant="outlined"
            placeholder="e.g. P68871"
            size="small"
            value={manualUniprotId}
            onChange={e => {
              onManualUniprotIdChange(e.target.value)
            }}
          />
        </div>
      )}

      {lookupMode === 'manual' && !manualUniprotId && (
        <Typography variant="body2" color="text.secondary">
          Search{' '}
          <ExternalLink href="https://www.uniprot.org/">UniProt</ExternalLink>
          {' or '}
          <ExternalLink href="https://alphafold.ebi.ac.uk/">
            AlphaFoldDB
          </ExternalLink>
        </Typography>
      )}
    </>
  )
}
