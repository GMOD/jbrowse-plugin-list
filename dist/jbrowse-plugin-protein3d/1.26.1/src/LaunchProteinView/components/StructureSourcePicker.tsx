import React from 'react'

import {
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'

import HelpButton from './HelpButton'
import { STRUCTURE_FILE_ACCEPT } from '../utils/readStructureFile'

export default function StructureSourcePicker({
  choice,
  setChoice,
  structureURL,
  setStructureURL,
  file,
  setFile,
}: {
  choice: string
  setChoice: (c: string) => void
  structureURL: string
  setStructureURL: (url: string) => void
  file?: File
  setFile: (f: File) => void
}) {
  return (
    <div style={{ display: 'flex', margin: 30 }}>
      <Typography>
        Open your structure file <HelpButton />
      </Typography>

      <FormControl component="fieldset">
        <RadioGroup
          value={choice}
          onChange={event => {
            setChoice(event.target.value)
          }}
        >
          <FormControlLabel value="file" control={<Radio />} label="File" />
          <FormControlLabel value="url" control={<Radio />} label="URL" />
        </RadioGroup>
      </FormControl>

      {choice === 'url' ? (
        <div>
          <Typography>Open a PDB/mmCIF/etc. file from remote URL</Typography>
          <TextField
            label="URL"
            value={structureURL}
            onChange={event => {
              setStructureURL(event.target.value)
            }}
          />
        </div>
      ) : (
        <div style={{ paddingTop: 20 }}>
          <Typography>
            Open a PDB/mmCIF/etc. file from your local drive
          </Typography>
          <Button variant="outlined" component="label">
            Choose file
            <input
              type="file"
              hidden
              accept={STRUCTURE_FILE_ACCEPT}
              onChange={({ target }) => {
                const f = target.files?.[0]
                if (f) {
                  setFile(f)
                }
                // picking the same file again, edited, fires a change
                target.value = ''
              }}
            />
          </Button>
          {file ? <Typography variant="body2">{file.name}</Typography> : null}
        </div>
      )}
    </div>
  )
}
