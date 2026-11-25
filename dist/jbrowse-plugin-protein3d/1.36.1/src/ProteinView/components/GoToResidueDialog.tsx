import React, { useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { observer } from 'mobx-react'

import { checkResidueQuery } from '../residueQuery'

import type { JBrowsePluginProteinViewModel } from '../model'

const GoToResidueDialog = observer(function GoToResidueDialog({
  model,
  handleClose,
}: {
  model: Pick<JBrowsePluginProteinViewModel, 'alignmentStructure' | 'addNotice'>
  handleClose: () => void
}) {
  const [text, setText] = useState('')
  const [problem, setProblem] = useState<string>()
  const structure = model.alignmentStructure

  const handleGo = () => {
    const checked = checkResidueQuery(text, structure?.mappedEntity)
    if ('problem' in checked) {
      setProblem(checked.problem)
    } else if (structure) {
      const { start, end } = checked.query
      structure
        .focusResidues({
          residues: { start: start.number, end: end.number },
        })
        .catch((e: unknown) => {
          model.addNotice(e)
        })
      handleClose()
    }
  }

  return (
    <Dialog open onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Go to residue{structure ? ` in ${structure.label}` : ''}
      </DialogTitle>
      <form
        onSubmit={event => {
          event.preventDefault()
          handleGo()
        }}
      >
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Residue"
            placeholder="R248"
            value={text}
            error={problem !== undefined}
            helperText={
              problem ??
              "A number or a range such as 245-250, in the structure's own numbering. A:248 names the protein by a chain, and every copy of it is lit. A residue the file numbers but has no atoms for lights nothing in 3D."
            }
            onChange={event => {
              setText(event.target.value)
              setProblem(undefined)
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!text.trim()}
          >
            Go
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
})

export default GoToResidueDialog
