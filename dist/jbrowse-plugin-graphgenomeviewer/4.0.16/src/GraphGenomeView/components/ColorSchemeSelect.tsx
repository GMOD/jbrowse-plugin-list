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
  return (
    <FormControl size="small" className={classes.formControl}>
      <InputLabel>Color</InputLabel>
      <Select
        value={model.chosenColorScheme}
        label="Color"
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
