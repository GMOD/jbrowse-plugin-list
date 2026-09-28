import { COLOR_SCHEMES } from '@jbrowse/bandage-core/colorSchemes'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import type { GraphPaneModel } from '../model'

const useStyles = makeStyles()({
  formControl: {
    minWidth: 100,
  },
})

const ColorSchemeSelect = observer(function ColorSchemeSelect({
  model,
}: {
  model: GraphPaneModel
}) {
  const { classes } = useStyles()
  // Lifted walks colour their own lanes and grey the rest, and a tube map
  // colours each tube by its path, so no scheme is on screen to pick
  const fixed = model.walkLift
    ? {
        value: 'By walk',
        why: 'Each lifted walk colours its own lane: set it under the menu, Walk, Colour',
      }
    : model.layoutResult?.tubeMap
      ? { value: 'By path', why: 'A tube map colours each tube by its path' }
      : undefined
  return (
    <FormControl
      size="small"
      className={classes.formControl}
      disabled={fixed !== undefined}
      title={fixed?.why}
    >
      <InputLabel>Color</InputLabel>
      <Select
        value={model.chosenColorScheme}
        label="Color"
        renderValue={fixed ? () => fixed.value : undefined}
        onChange={e => {
          model.setColorScheme(e.target.value)
        }}
      >
        {COLOR_SCHEMES.map(({ value, label }) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
})

export default ColorSchemeSelect
