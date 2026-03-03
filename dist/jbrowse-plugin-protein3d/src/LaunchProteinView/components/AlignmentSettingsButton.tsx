import React, { useState } from 'react'

import SettingsIcon from '@mui/icons-material/Settings'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { parsePairwise } from 'clustal-js'

import {
  ALIGNMENT_ALGORITHMS,
  AlignmentAlgorithm,
} from '../../ProteinView/types'
import { PairwiseAlignment } from '../../mappings'

interface AlignmentSettingsButtonProps {
  value: AlignmentAlgorithm
  onChange: (algorithm: AlignmentAlgorithm) => void
  onManualAlignment?: (alignment: PairwiseAlignment) => void
}

export default function AlignmentSettingsButton({
  value,
  onChange,
  onManualAlignment,
}: AlignmentSettingsButtonProps) {
  const [open, setOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [tempAlgorithm, setTempAlgorithm] = useState<AlignmentAlgorithm>(value)
  const [manualAlignment, setManualAlignment] = useState('')
  const [parseError, setParseError] = useState<string>()

  const handleOpen = () => {
    setTempAlgorithm(value)
    setManualAlignment('')
    setParseError(undefined)
    setTabValue(0)
    setOpen(true)
  }

  const handleSave = () => {
    if (tabValue === 0) {
      onChange(tempAlgorithm)
    } else if (tabValue === 1 && manualAlignment.trim() && onManualAlignment) {
      try {
        const parsed = parsePairwise(manualAlignment.trim())
        onManualAlignment(parsed)
      } catch (e) {
        setParseError(`Failed to parse alignment: ${e}`)
        return
      }
    }
    setOpen(false)
  }

  const handleCancel = () => {
    setTempAlgorithm(value)
    setManualAlignment('')
    setParseError(undefined)
    setOpen(false)
  }

  return (
    <>
      <IconButton onClick={handleOpen} size="small" title="Alignment settings">
        <SettingsIcon />
      </IconButton>

      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Alignment Settings</DialogTitle>
        <DialogContent>
          <Tabs
            value={tabValue}
            onChange={(_, val) => {
              setTabValue(val)
            }}
            sx={{ mb: 2 }}
          >
            <Tab label="Automatic" />
            <Tab label="Manual" disabled={!onManualAlignment} />
          </Tabs>

          {tabValue === 0 ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose the algorithm for aligning transcript sequences to
                protein structures.
              </Typography>

              <FormControl component="fieldset">
                <FormLabel component="legend">Algorithm</FormLabel>
                <RadioGroup
                  value={tempAlgorithm}
                  onChange={event => {
                    setTempAlgorithm(event.target.value as AlignmentAlgorithm)
                  }}
                >
                  <FormControlLabel
                    value={ALIGNMENT_ALGORITHMS.SMITH_WATERMAN}
                    control={<Radio />}
                    label="Smith-Waterman (local alignment)"
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 4, mt: -1, mb: 1 }}
                  >
                    Finds best matching region. Recommended for most use cases.
                  </Typography>

                  <FormControlLabel
                    value={ALIGNMENT_ALGORITHMS.NEEDLEMAN_WUNSCH}
                    control={<Radio />}
                    label="Needleman-Wunsch (global alignment)"
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 4, mt: -1, mb: 1 }}
                  >
                    End-to-end alignment. Use when sequences should align
                    completely.
                  </Typography>
                </RadioGroup>
              </FormControl>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Paste a pre-computed alignment in Clustal format. The first
                sequence should be the transcript and the second should be the
                structure.
              </Typography>
              <TextField
                multiline
                rows={10}
                fullWidth
                placeholder={`Example:
a  MKAAYLSMFGKEDHKPFGD
   |||||||||||||||||||
b  MKAAYLSMFGKEDHKPFGD`}
                value={manualAlignment}
                onChange={e => {
                  setManualAlignment(e.target.value)
                  setParseError(undefined)
                }}
                sx={{ fontFamily: 'monospace', fontSize: 12 }}
              />
              {parseError ? (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {parseError}
                </Typography>
              ) : null}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={tabValue === 1 && !manualAlignment.trim()}
          >
            {tabValue === 0 ? 'Save' : 'Apply Alignment'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
