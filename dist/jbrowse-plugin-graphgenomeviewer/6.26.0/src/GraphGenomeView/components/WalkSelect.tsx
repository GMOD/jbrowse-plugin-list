import { useId } from 'react'

import { getSession } from '@jbrowse/core/util'
import {
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import { ChooseWalksDialog, WALK_MENU_ITEMS } from '../pane/paneBase'

import type { GraphPaneModel } from '../model'

const useStyles = makeStyles()({
  formControl: {
    minWidth: 130,
    maxWidth: 260,
  },
})

// Which walks to lift out of the drawing: Bandage's path highlight, for as many
// of the haplotypes a GBZ cut carries as the reader picks. Absent from a graph
// with no walks, and from a tube map, whose tubes are the walks.
const WalkSelect = observer(function WalkSelect({
  model,
}: {
  model: GraphPaneModel
}) {
  const { classes } = useStyles()
  const labelId = useId()
  const { walkChoices } = model
  if (walkChoices.length === 0 || !model.liftsWalks) {
    return null
  }
  const names = new Set(walkChoices.map(c => c.name))
  const labels = new Map(walkChoices.map(c => [c.name, c.label]))
  const picked = model.walkLayers
    .map(layer => layer.walk)
    .filter(name => names.has(name))
  if (walkChoices.length > WALK_MENU_ITEMS) {
    return (
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        data-testid="graph-walk-choose"
        onClick={() => {
          getSession(model).queueDialog(onClose => [
            ChooseWalksDialog,
            { model, onClose },
          ])
        }}
      >
        {picked.length > 0
          ? `${picked.length} of ${walkChoices.length} haplotypes`
          : 'Highlight haplotypes...'}
      </Button>
    )
  }
  return (
    <FormControl size="small" className={classes.formControl}>
      <InputLabel id={labelId}>Highlight</InputLabel>
      <Select
        labelId={labelId}
        multiple
        value={picked}
        label="Highlight"
        data-testid="graph-walk-select"
        renderValue={selected => selected.map(n => labels.get(n)).join(', ')}
        onChange={e => {
          const { value } = e.target
          model.liftWalks(typeof value === 'string' ? value.split(',') : value)
        }}
      >
        {walkChoices.map(({ name, label }) => (
          <MenuItem key={name} value={name} dense>
            <Checkbox size="small" checked={picked.includes(name)} />
            <ListItemText primary={label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
})

export default WalkSelect
