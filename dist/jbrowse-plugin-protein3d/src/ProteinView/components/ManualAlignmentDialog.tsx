import React, { useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'
import { parsePairwise } from 'clustal-js'
import { observer } from 'mobx-react'

import { JBrowsePluginProteinViewModel } from '../model'

const ManualAlignmentDialog = observer(function ManualAlignmentDialog({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const [alignment, setAlignment] = useState('')
  const [parseError, setParseError] = useState<string>()
  const { showManualAlignmentDialog, structures } = model

  const handleClose = () => {
    setAlignment('')
    setParseError(undefined)
    model.setShowManualAlignmentDialog(false)
  }

  const handleApply = () => {
    if (!alignment.trim()) {
      return
    }
    try {
      const parsed = parsePairwise(alignment.trim())
      const structure = structures[0]
      if (structure) {
        structure.setAlignment(parsed)
      }
      handleClose()
    } catch (e) {
      setParseError(`Failed to parse alignment: ${e}`)
    }
  }

  if (!showManualAlignmentDialog) {
    return null
  }

  return (
    <Dialog open onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Manual Alignment</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Paste a pre-computed alignment in Clustal format. The first sequence
          should be the transcript and the second should be the structure.
        </Typography>
        <TextField
          multiline
          rows={12}
          fullWidth
          placeholder={`Example:
a  MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG
   |||||||||||||||||||||||||||||||||||||
b  MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG`}
          value={alignment}
          onChange={e => {
            setAlignment(e.target.value)
            setParseError(undefined)
          }}
          InputProps={{
            sx: { fontFamily: 'monospace', fontSize: 12 },
          }}
        />
        {parseError ? (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {parseError}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleApply}
          variant="contained"
          color="primary"
          disabled={!alignment.trim()}
        >
          Apply Alignment
        </Button>
      </DialogActions>
    </Dialog>
  )
})

export default ManualAlignmentDialog
