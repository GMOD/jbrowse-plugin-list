import React, { useState } from 'react'

import { ErrorMessage } from '@jbrowse/core/ui'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'

import {
  getAlphaFoldStructureUrl,
  getPdbStructureUrl,
} from '../../LaunchProteinView/utils/launchViewUtils'
import { JBrowsePluginProteinViewModel } from '../model'

const AddStructureDialog = observer(function AddStructureDialog({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const [file, setFile] = useState<File>()
  const [pdbId, setPdbId] = useState('')
  const [uniprotId, setUniprotId] = useState('')
  const [choice, setChoice] = useState('pdb')
  const [structureURL, setStructureURL] = useState('')
  const [error, setError] = useState<unknown>()
  const { showAddStructureDialog } = model

  const handleClose = () => {
    setFile(undefined)
    setPdbId('')
    setUniprotId('')
    setStructureURL('')
    setError(undefined)
    model.setShowAddStructureDialog(false)
  }

  const handleAdd = async () => {
    try {
      let url = structureURL
      let data: string | undefined

      if (choice === 'pdb' && pdbId) {
        url = getPdbStructureUrl(pdbId)
      }
      if (choice === 'uniprot' && uniprotId) {
        url = getAlphaFoldStructureUrl(uniprotId.toUpperCase())
      }
      if (choice === 'file' && file) {
        data = await file.text()
      }

      if (url || data) {
        await model.addStructureAndSuperpose({ url: url || undefined, data })
        handleClose()
      }
    } catch (e) {
      console.error(e)
      setError(e)
    }
  }

  if (!showAddStructureDialog) {
    return null
  }

  const canAdd =
    (choice === 'url' && structureURL !== '') ||
    (choice === 'file' && file !== undefined) ||
    (choice === 'pdb' && pdbId !== '') ||
    (choice === 'uniprot' && uniprotId !== '')

  return (
    <Dialog open onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Structure</DialogTitle>
      <DialogContent>
        {error ? <ErrorMessage error={error} /> : null}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add another structure to superpose on the existing structure(s).
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <RadioGroup
            value={choice}
            onChange={event => {
              setChoice(event.target.value)
            }}
          >
            <FormControlLabel value="pdb" control={<Radio />} label="PDB ID" />
            <FormControlLabel
              value="uniprot"
              control={<Radio />}
              label="UniProt ID (AlphaFold)"
            />
            <FormControlLabel value="url" control={<Radio />} label="URL" />
            <FormControlLabel value="file" control={<Radio />} label="File" />
          </RadioGroup>
        </FormControl>

        {choice === 'pdb' ? (
          <TextField
            fullWidth
            value={pdbId}
            onChange={event => {
              setPdbId(event.target.value.toUpperCase())
            }}
            label="PDB ID (e.g. 1CRN)"
            placeholder="Enter PDB ID"
            sx={{ mb: 2 }}
          />
        ) : null}

        {choice === 'uniprot' ? (
          <TextField
            fullWidth
            value={uniprotId}
            onChange={event => {
              setUniprotId(event.target.value.toUpperCase())
            }}
            label="UniProt ID (e.g. P04637)"
            placeholder="Enter UniProt ID"
            helperText="Will fetch the AlphaFold v6 predicted structure"
            sx={{ mb: 2 }}
          />
        ) : null}

        {choice === 'url' ? (
          <TextField
            fullWidth
            label="Structure URL"
            value={structureURL}
            onChange={event => {
              setStructureURL(event.target.value)
            }}
            placeholder="https://files.rcsb.org/download/1CRN.cif"
            sx={{ mb: 2 }}
          />
        ) : null}

        {choice === 'file' ? (
          <div style={{ marginBottom: 16 }}>
            <Button variant="outlined" component="label">
              {file ? file.name : 'Choose File'}
              <input
                type="file"
                hidden
                accept=".pdb,.cif,.mmcif,.ent"
                onChange={({ target }) => {
                  const f = target.files?.[0]
                  if (f) {
                    setFile(f)
                  }
                }}
              />
            </Button>
            {file ? (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {file.name}
              </Typography>
            ) : null}
          </div>
        ) : null}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Tip: Structures will be automatically superposed using TM-align. For
          manual control, use the Mol* controls (🔧 wrench icon).
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => {
            handleAdd().catch((e: unknown) => {
              console.error(e)
            })
          }}
          variant="contained"
          color="primary"
          disabled={!canAdd}
        >
          Add Structure
        </Button>
      </DialogActions>
    </Dialog>
  )
})

export default AddStructureDialog
