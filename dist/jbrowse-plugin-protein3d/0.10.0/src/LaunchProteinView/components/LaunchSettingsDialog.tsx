import React, { useState } from 'react'

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material'

import { getLaunchSideBySide, setLaunchSideBySide } from '../utils/sideBySide'

// Small, self-contained launch settings (NOT the global preferences dialog):
// just the options that affect how this protein view opens.
export default function LaunchSettingsDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [sideBySide, setSideBySide] = useState(() => getLaunchSideBySide())
  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose()
      }}
    >
      <DialogTitle>Launch settings</DialogTitle>
      <DialogContent>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={sideBySide} />}
            label="Open protein view side-by-side with the genome view"
            onChange={(_, checked) => {
              setSideBySide(checked)
              setLaunchSideBySide(checked)
            }}
          />
        </FormGroup>
        <Typography variant="body2" color="text.secondary">
          When enabled, launching a protein view places it to the right of the
          connected genome view in a split layout instead of stacking it below.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            onClose()
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
