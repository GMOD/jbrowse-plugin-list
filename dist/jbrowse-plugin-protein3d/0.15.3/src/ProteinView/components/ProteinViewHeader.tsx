import React, { useState } from 'react'

import { LoadingEllipses } from '@jbrowse/core/ui'
import PaletteIcon from '@mui/icons-material/Palette'
import TuneIcon from '@mui/icons-material/Tune'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { observer } from 'mobx-react'

import AddStructureDialog from './AddStructureDialog'
import { MolstarLegendKey } from './ColorKey'
import HeaderStructureRows from './HeaderStructureRow'
import ProteinAlignment from './ProteinAlignment'
import ProteinAlignmentHelpButton from './ProteinAlignmentHelpButton'
import { COLOR_SCHEMES } from '../applyColorTheme'

import type { JBrowsePluginProteinViewModel } from '../model'

// An icon rather than a select showing the scheme's name, which took the
// width of a structure's coverage line on every row beside it
const ColorSchemeMenu = observer(function ColorSchemeMenu({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const current = COLOR_SCHEMES.find(s => s.value === model.colorScheme)
  const title = `Color scheme: ${current?.label ?? model.colorScheme}`
  return (
    <>
      <Tooltip title={title}>
        <IconButton
          size="small"
          aria-label={title}
          onClick={event => {
            setAnchorEl(event.currentTarget)
          }}
        >
          <PaletteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null)
        }}
      >
        {COLOR_SCHEMES.map(scheme => (
          <MenuItem
            key={scheme.value}
            dense
            selected={scheme.value === model.colorScheme}
            onClick={() => {
              model.setColorScheme(scheme.value)
              setAnchorEl(null)
            }}
          >
            {scheme.label}
          </MenuItem>
        ))}
      </Menu>
    </>
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
        keepMounted
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
  const { alignmentStructure, showAlignment, colorLegend } = model
  return (
    <div>
      {/* The view's controls share the first structure row's line rather than
          taking one of their own, which the hover readout used to fill only
          while something was hovered. */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <HeaderStructureRows model={model} />
        <div
          style={{
            display: 'flex',
            gap: 4,
            alignItems: 'center',
            flexShrink: 0,
            minHeight: 24,
          }}
        >
          <ColorSchemeMenu model={model} />
          <DisplaySettingsMenu model={model} />
          <ProteinAlignmentHelpButton model={model} />
        </div>
      </div>
      {colorLegend ? (
        <MolstarLegendKey title="Structure colors" legend={colorLegend} />
      ) : null}
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
