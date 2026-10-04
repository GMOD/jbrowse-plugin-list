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

type SamplePicker = Pick<
  GraphPaneModel,
  'walkRowSampleChoices' | 'walkRowSamples' | 'setWalkRowSamples'
>

// Which samples' walks walk rows show, searched by name, in the order picked
const ChooseSamplesDialog = observer(function ChooseSamplesDialog({
  model,
  onClose,
}: {
  model: SamplePicker
  onClose: () => void
}) {
  const { samples } = model.walkRowSampleChoices
  const [picked, setPicked] = useState(() =>
    (model.walkRowSamples ?? []).filter(s => samples.includes(s)),
  )
  return (
    <Dialog open onClose={onClose} title="Choose samples">
      <DialogContent>
        <Autocomplete
          multiple
          disableCloseOnSelect
          data-testid="graph-choose-samples"
          options={samples}
          value={picked}
          onChange={(_, value) => {
            setPicked(value)
          }}
          renderOption={({ key, ...props }, sample, { selected }) => (
            <li key={key} {...props}>
              <Checkbox size="small" checked={selected} />
              {sample}
            </li>
          )}
          renderInput={params => (
            <TextField
              {...params}
              autoFocus
              label="Samples"
              placeholder="type to search"
            />
          )}
        />
        <Typography variant="caption" color="text.secondary">
          {samples.length.toLocaleString()} samples in this cut. Their walks
          show in pairs, in the order picked.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={picked.length === 0}
          onClick={() => {
            model.setWalkRowSamples(picked)
            onClose()
          }}
        >
          Show these samples
        </Button>
      </DialogActions>
    </Dialog>
  )
})

export default ChooseSamplesDialog
