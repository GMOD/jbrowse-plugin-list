import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
} from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import { LAYOUT_MODES } from '../layoutModes'

import type { GraphGenomeViewModel } from '../model'

const useStyles = makeStyles()({
  formControl: {
    minWidth: 150,
  },
})

const LayoutSelect = observer(function LayoutSelect({
  model,
}: {
  model: GraphGenomeViewModel
}) {
  const { classes } = useStyles()
  const { graph } = model
  return (
    <FormControl size="small" className={classes.formControl}>
      <InputLabel>Layout</InputLabel>
      <Select
        value={model.layoutMode}
        label="Layout"
        data-testid="graph-layout-select"
        onChange={e => {
          model.setLayoutMode(e.target.value)
          void model.recomputeLayout()
        }}
      >
        {LAYOUT_MODES.map(({ value, label, description, available }) => (
          <MenuItem
            key={value}
            value={value}
            disabled={graph ? !available(graph) : false}
          >
            <Tooltip title={description} placement="right">
              <span>{label}</span>
            </Tooltip>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
})

export default LayoutSelect
