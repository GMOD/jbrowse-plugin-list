import { useState } from 'react'

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
import { observer } from 'mobx-react'

import type { GraphPaneModel } from '../model'

type WalkPicker = Pick<
  GraphPaneModel,
  'walkChoices' | 'walkLayers' | 'walkLabel' | 'liftWalks'
>

// Which haplotypes to highlight, searched by name, for a graph with more walks than a
// menu can list
const ChooseWalksDialog = observer(function ChooseWalksDialog({
  model,
  onClose,
}: {
  model: WalkPicker
  onClose: () => void
}) {
  const { walkChoices } = model
  const names = new Set(walkChoices.map(c => c.name))
  const [picked, setPicked] = useState(() =>
    model.walkLayers.map(l => l.walk).filter(name => names.has(name)),
  )
  return (
    <Dialog open onClose={onClose} title="Choose haplotypes">
      <DialogContent>
        <Autocomplete
          multiple
          disableCloseOnSelect
          data-testid="graph-choose-walks"
          options={walkChoices.map(c => c.name)}
          getOptionLabel={name => model.walkLabel(name)}
          value={picked}
          onChange={(_, value) => {
            setPicked(value)
          }}
          renderOption={({ key, ...props }, name, { selected }) => (
            <li key={key} {...props}>
              <Checkbox size="small" checked={selected} />
              {model.walkLabel(name)}
            </li>
          )}
          renderInput={params => (
            <TextField
              {...params}
              autoFocus
              label="Haplotypes"
              placeholder="type to search"
            />
          )}
        />
        <Typography variant="caption" color="text.secondary">
          {walkChoices.length.toLocaleString()} haplotypes in this cut. The ones
          picked are highlighted in this order, and the rest fades.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => {
            model.liftWalks(picked)
            onClose()
          }}
        >
          Highlight these
        </Button>
      </DialogActions>
    </Dialog>
  )
})

export default ChooseWalksDialog
