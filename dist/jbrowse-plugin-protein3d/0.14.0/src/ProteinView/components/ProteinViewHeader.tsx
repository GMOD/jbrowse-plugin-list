import React, { useState } from 'react'

import { LoadingEllipses } from '@jbrowse/core/ui'
import TuneIcon from '@mui/icons-material/Tune'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { observer } from 'mobx-react'

import AddStructureDialog from './AddStructureDialog'
import HeaderStructureInfo from './HeaderStructureInfo'
import HeaderStructureRows from './HeaderStructureRow'
import ProteinAlignment from './ProteinAlignment'
import { COLOR_SCHEMES } from '../applyColorTheme'

import type { JBrowsePluginProteinViewModel } from '../model'

const ColorSchemeSelect = observer(function ColorSchemeSelect({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  return (
    <TextField
      select
      size="small"
      label="Color"
      value={model.colorScheme}
      onChange={event => {
        const scheme = COLOR_SCHEMES.find(s => s.value === event.target.value)
        if (scheme) {
          model.setColorScheme(scheme.value)
        }
      }}
      slotProps={{ select: { native: false } }}
      sx={{ minWidth: 180 }}
    >
      {COLOR_SCHEMES.map(scheme => (
        <MenuItem key={scheme.value} value={scheme.value}>
          {scheme.label}
        </MenuItem>
      ))}
    </TextField>
  )
})

function ToggleMenuItem({
  checked,
  label,
  onToggle,
}: {
  checked: boolean
  label: string
  onToggle: () => void
}) {
  return (
    <MenuItem
      onClick={() => {
        onToggle()
      }}
      dense
    >
      <ListItemIcon>
        <Checkbox checked={checked} size="small" edge="start" disableRipple />
      </ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </MenuItem>
  )
}

// Every toggle the view has, in one menu. The view menu carries actions, so a
// reader looking for a checkbox has one place to look rather than two lists
// that used to hold overlapping copies of the same four.
const DisplaySettingsMenu = observer(function DisplaySettingsMenu({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  return (
    <>
      <Tooltip title="Display settings">
        <IconButton
          size="small"
          onClick={event => {
            setAnchorEl(event.currentTarget)
          }}
        >
          <TuneIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null)
        }}
      >
        {model.displayToggles.map(toggle => (
          <ToggleMenuItem
            key={toggle.label}
            checked={toggle.checked}
            label={toggle.label}
            onToggle={toggle.toggle}
          />
        ))}
        <Divider />
        {model.behaviorToggles.map(toggle => (
          <ToggleMenuItem
            key={toggle.label}
            checked={toggle.checked}
            label={toggle.label}
            onToggle={toggle.toggle}
          />
        ))}
      </Menu>
    </>
  )
})

const ProteinViewHeader = observer(function ProteinViewHeader({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const { alignmentStructure, showAlignment } = model
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <HeaderStructureInfo model={model} />
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <ColorSchemeSelect model={model} />
          <DisplaySettingsMenu model={model} />
        </div>
      </div>
      <HeaderStructureRows model={model} />
      {showAlignment && alignmentStructure?.pairwiseAlignment ? (
        <ProteinAlignment model={alignmentStructure} />
      ) : showAlignment && alignmentStructure?.alignmentPending ? (
        <LoadingEllipses message="Loading pairwise alignment" />
      ) : null}
      <AddStructureDialog model={model} />
    </div>
  )
})

export default ProteinViewHeader
