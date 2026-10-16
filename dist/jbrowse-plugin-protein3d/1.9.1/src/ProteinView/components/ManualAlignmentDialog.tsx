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

import { entityAlignedTo, withoutStopColumn } from '../entityAlignedTo'

import type { JBrowsePluginProteinViewModel } from '../model'

const ManualAlignmentDialog = observer(function ManualAlignmentDialog({
  model,
  handleClose,
}: {
  model: Pick<JBrowsePluginProteinViewModel, 'alignmentStructure'>
  handleClose: () => void
}) {
  const [alignment, setAlignment] = useState('')
  const [parseError, setParseError] = useState<string>()
  const { alignmentStructure } = model

  const handleApply = () => {
    if (alignment.trim()) {
      try {
        const parsed = parsePairwise(alignment.trim())
        const entities = alignmentStructure?.entities
        // Rejected here rather than committed: the `coordinateMapper` getter
        // throws on a bad pair during render, outside this catch. The check is
        // the one the model applies to an imported alignment, so a paste whose
        // second row spells another chain switches to that chain.
        const fit =
          alignmentStructure && entities
            ? entityAlignedTo(
                parsed,
                alignmentStructure.userProvidedTranscriptSequence,
                entities,
                alignmentStructure.mappedEntityId,
              )
            : undefined
        if (!alignmentStructure || !fit) {
          setParseError('No structure loaded to apply alignment to')
        } else if ('problem' in fit) {
          setParseError(fit.problem)
        } else {
          alignmentStructure.importAlignment(withoutStopColumn(parsed))
          handleClose()
        }
      } catch (e) {
        setParseError(`Failed to parse alignment: ${e}`)
      }
    }
  }

  return (
    <Dialog open onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Import manual alignment
        {alignmentStructure?.label ? ` for ${alignmentStructure.label}` : ''}
      </DialogTitle>
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
transcript  MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG
            |||||||||||||||||||||||||||||||||||||
structure   MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG`}
          value={alignment}
          onChange={e => {
            setAlignment(e.target.value)
            setParseError(undefined)
          }}
          slotProps={{
            htmlInput: { style: { fontFamily: 'monospace', fontSize: 12 } },
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
          onClick={() => {
            handleApply()
          }}
          variant="contained"
          color="primary"
          disabled={!alignment.trim()}
        >
          Apply alignment
        </Button>
      </DialogActions>
    </Dialog>
  )
})

export default ManualAlignmentDialog
