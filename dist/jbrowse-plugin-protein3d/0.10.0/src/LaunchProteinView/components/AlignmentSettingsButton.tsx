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
  Typography,
} from '@mui/material'

import { ALIGNMENT_ALGORITHMS } from '../../ProteinView/types'

import type { AlignmentAlgorithm } from '../../ProteinView/types'

function AlgorithmOption({
  value,
  label,
  description,
}: {
  value: AlignmentAlgorithm
  label: string
  description: string
}) {
  return (
    <>
      <FormControlLabel value={value} control={<Radio />} label={label} />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ ml: 4, mt: -1, mb: 1 }}
      >
        {description}
      </Typography>
    </>
  )
}

export default function AlignmentSettingsButton({
  value,
  onChange,
}: {
  value: AlignmentAlgorithm
  onChange: (algorithm: AlignmentAlgorithm) => void
}) {
  const [open, setOpen] = useState(false)
  const [tempAlgorithm, setTempAlgorithm] = useState<AlignmentAlgorithm>(value)

  const handleOpen = () => {
    setTempAlgorithm(value)
    setOpen(true)
  }

  return (
    <>
      <IconButton onClick={handleOpen} size="small" title="Alignment settings">
        <SettingsIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false)
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alignment settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose the algorithm for aligning transcript sequences to protein
            structures. A hand-made alignment can be imported from the protein
            view&apos;s menu once it is open.
          </Typography>

          <FormControl component="fieldset">
            <FormLabel component="legend">Algorithm</FormLabel>
            <RadioGroup
              value={tempAlgorithm}
              onChange={event => {
                setTempAlgorithm(event.target.value as AlignmentAlgorithm)
              }}
            >
              <AlgorithmOption
                value={ALIGNMENT_ALGORITHMS.SMITH_WATERMAN}
                label="Smith-Waterman (local alignment)"
                description="Finds best matching region. Recommended for most use cases."
              />
              <AlgorithmOption
                value={ALIGNMENT_ALGORITHMS.NEEDLEMAN_WUNSCH}
                label="Needleman-Wunsch (global alignment)"
                description="End-to-end alignment. Use when sequences should align completely."
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onChange(tempAlgorithm)
              setOpen(false)
            }}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
