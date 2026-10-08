import { useState } from 'react'
import type { ReactNode } from 'react'

import { Dialog } from '@jbrowse/core/ui'
import {
  Autocomplete,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from '@mui/material'

// A set of names picked by search, in the order picked, committed on confirm
export default function PickNamesDialog({
  title,
  label,
  caption,
  testId,
  options,
  initial,
  optionLabel = name => name,
  confirmLabel,
  onPick,
  onClose,
}: {
  title: string
  label: string
  caption: ReactNode
  testId: string
  options: string[]
  initial: string[]
  optionLabel?: (name: string) => string
  confirmLabel: (picked: string[]) => string
  onPick: (picked: string[]) => void
  onClose: () => void
}) {
  const [picked, setPicked] = useState(() =>
    initial.filter(name => options.includes(name)),
  )
  return (
    <Dialog open onClose={onClose} title={title}>
      <DialogContent>
        <Autocomplete
          multiple
          disableCloseOnSelect
          data-testid={testId}
          options={options}
          getOptionLabel={optionLabel}
          value={picked}
          onChange={(_, value) => {
            setPicked(value)
          }}
          renderOption={({ key, ...props }, name, { selected }) => (
            <li key={key} {...props}>
              <Checkbox size="small" checked={selected} />
              {optionLabel(name)}
            </li>
          )}
          renderInput={params => (
            <TextField
              {...params}
              autoFocus
              label={label}
              placeholder="type to search"
            />
          )}
        />
        <Typography variant="caption" color="text.secondary">
          {caption}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => {
            onPick(picked)
            onClose()
          }}
        >
          {confirmLabel(picked)}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
