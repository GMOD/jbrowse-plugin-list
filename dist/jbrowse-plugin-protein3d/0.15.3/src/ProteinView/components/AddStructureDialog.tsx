import React, { useState } from 'react'

import { ErrorMessage } from '@jbrowse/core/ui'
import {
  Button,
  Checkbox,
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
  STRUCTURE_FILE_ACCEPT,
  readStructureFile,
} from '../../LaunchProteinView/utils/readStructureFile'

import type { JBrowsePluginProteinViewModel } from '../model'
import type { ProteinStructureSpec } from '../proteinViewSpec'

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
  const [mapToTranscript, setMapToTranscript] = useState(true)
  const { showAddStructureDialog } = model
  const canMap = !!model.primaryStructure?.userProvidedTranscriptSequence

  const handleClose = () => {
    setFile(undefined)
    setPdbId('')
    setUniprotId('')
    setStructureURL('')
    setError(undefined)
    model.setShowAddStructureDialog(false)
  }

  // The Structure model resolves the `pdbId`/`uniprotId` shorthands into a url
  // at hydration, so the dialog states the source rather than rebuilding the
  // AlphaFold/RCSB url formats a second time.
  const handleAdd = async () => {
    try {
      const source: ProteinStructureSpec | undefined =
        choice === 'pdb' && pdbId
          ? { pdbId }
          : choice === 'uniprot' && uniprotId
            ? { uniprotId }
            : choice === 'url' && structureURL
              ? { url: structureURL }
              : choice === 'file' && file
                ? { data: await readStructureFile(file) }
                : undefined

      if (source) {
        // Copying the primary's transcript, feature and genome view makes the
        // new structure a peer: it gets its own alignment, hover and click
        // mapping, rather than only a superposed shape.
        const primary = model.primaryStructure
        const mapping =
          mapToTranscript && primary?.userProvidedTranscriptSequence
            ? {
                userProvidedTranscriptSequence:
                  primary.userProvidedTranscriptSequence,
                feature: primary.feature,
                connectedViewId: primary.connectedViewId,
              }
            : {}
        model.addStructure({ ...source, ...mapping })
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
      <DialogTitle>Add structure</DialogTitle>
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
              {file ? file.name : 'Choose file'}
              <input
                type="file"
                hidden
                accept={STRUCTURE_FILE_ACCEPT}
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

        {canMap ? (
          <FormControlLabel
            control={
              <Checkbox
                checked={mapToTranscript}
                onChange={event => {
                  setMapToTranscript(event.target.checked)
                }}
              />
            }
            label="Map to the same transcript as the first structure (alignment, hover and click linked to the genome)"
          />
        ) : null}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Tip: Structures will be automatically superposed using TM-align. For
          manual control, use the Mol* controls (🔧 wrench icon).
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleClose()
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            void handleAdd()
          }}
          variant="contained"
          color="primary"
          disabled={!canAdd}
        >
          Add structure
        </Button>
      </DialogActions>
    </Dialog>
  )
})

export default AddStructureDialog
