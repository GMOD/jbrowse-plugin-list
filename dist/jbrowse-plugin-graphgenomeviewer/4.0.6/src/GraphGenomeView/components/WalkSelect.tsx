import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import type { GraphGenomeViewModel } from '../model'

const useStyles = makeStyles()({
  formControl: {
    minWidth: 130,
    maxWidth: 220,
  },
})

// Which walk to lift out of the drawing: Bandage's path highlight, with the
// haplotypes a GBZ cut carries. Absent from a graph with no walks.
const WalkSelect = observer(function WalkSelect({
  model,
}: {
  model: GraphGenomeViewModel
}) {
  const { classes } = useStyles()
  const { walkChoices } = model
  if (walkChoices.length === 0) {
    return null
  }
  const names = new Set(walkChoices.map(c => c.name))
  return (
    <FormControl size="small" className={classes.formControl}>
      <InputLabel>Walk</InputLabel>
      <Select
        value={names.has(model.highlightedPath) ? model.highlightedPath : ''}
        label="Walk"
        data-testid="graph-walk-select"
        onChange={e => {
          model.setHighlightedPath(e.target.value)
        }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {walkChoices.map(({ name, label }) => (
          <MenuItem key={name} value={name}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
})

export default WalkSelect
