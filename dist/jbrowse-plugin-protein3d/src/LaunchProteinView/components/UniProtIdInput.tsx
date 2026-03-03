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

import type { SequenceSearchType } from '../hooks/useAlphaFoldSequenceSearch'

export type LookupMode = 'auto' | 'manual' | 'feature' | 'sequence'

interface UniProtIdInputProps {
  lookupMode: LookupMode
  onLookupModeChange: (mode: LookupMode) => void
  manualUniprotId: string
  onManualUniprotIdChange: (id: string) => void
  featureUniprotId?: string
  hasProteinSequence?: boolean
  sequenceSearchType?: SequenceSearchType
  onSequenceSearchTypeChange?: (type: SequenceSearchType) => void
  endContent?: React.ReactNode
}

/**
 * Component to handle UniProt ID input mode selection
 */
export default function UniProtIdInput({
  lookupMode,
  onLookupModeChange,
  manualUniprotId,
  onManualUniprotIdChange,
  featureUniprotId,
  hasProteinSequence,
  sequenceSearchType,
  onSequenceSearchTypeChange,
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
              onLookupModeChange(event.target.value as LookupMode)
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
            {hasProteinSequence && (
              <FormControlLabel
                value="sequence"
                control={<Radio />}
                label="Search sequence against AlphaFoldDB API"
              />
            )}
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

      {lookupMode === 'sequence' &&
        sequenceSearchType &&
        onSequenceSearchTypeChange && (
          <div>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={sequenceSearchType}
                onChange={event => {
                  onSequenceSearchTypeChange(
                    event.target.value as SequenceSearchType,
                  )
                }}
              >
                <FormControlLabel
                  value="md5"
                  control={<Radio />}
                  label="Exact match"
                />
                <FormControlLabel
                  value="sequence"
                  control={<Radio />}
                  label="Fuzzy match"
                />
              </RadioGroup>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              May not find the canonical UniProt entry.
            </Typography>
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
