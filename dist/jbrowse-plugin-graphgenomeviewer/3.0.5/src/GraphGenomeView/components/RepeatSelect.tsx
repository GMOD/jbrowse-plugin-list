import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import type { GraphGenomeViewModel } from '../model'

const useStyles = makeStyles()({
  formControl: {
    minWidth: 130,
    maxWidth: 240,
  },
})

// Which tandem repeat array the walk rows measure between and tile by, from
// the session's repeat annotation over the window. Only the walk rows read it.
const RepeatSelect = observer(function RepeatSelect({
  model,
}: {
  model: GraphGenomeViewModel
}) {
  const { classes } = useStyles()
  const { repeatChoices } = model
  if (model.layoutMode !== 'walkrows' || repeatChoices.length === 0) {
    return null
  }
  const keys = new Set(repeatChoices.map(r => r.key))
  return (
    <FormControl size="small" className={classes.formControl}>
      <InputLabel>Repeat</InputLabel>
      <Select
        value={keys.has(model.repeatKey) ? model.repeatKey : ''}
        label="Repeat"
        data-testid="graph-repeat-select"
        onChange={e => {
          model.setRepeatKey(e.target.value)
        }}
      >
        <MenuItem value="">
          <em>Whole window</em>
        </MenuItem>
        {repeatChoices.map(({ key, name, unit }) => (
          <MenuItem key={key} value={key}>
            {name} · {unit.toLocaleString()} bp unit
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
})

export default RepeatSelect
