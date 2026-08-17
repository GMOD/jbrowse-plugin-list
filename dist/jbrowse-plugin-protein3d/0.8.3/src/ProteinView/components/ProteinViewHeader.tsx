import React, { useState } from 'react'

import { LoadingEllipses } from '@jbrowse/core/ui'
import TuneIcon from '@mui/icons-material/Tune'
import Checkbox from '@mui/material/Checkbox'
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
import ProteinAlignment from './ProteinAlignment'
import { COLOR_SCHEMES } from '../applyColorTheme'

import type {
  JBrowsePluginProteinStructureModel,
  JBrowsePluginProteinViewModel,
} from '../model'

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

function getDisplayToggles(model: JBrowsePluginProteinViewModel) {
  return [
    {
      label: 'Show alignment',
      checked: model.showAlignment,
      onToggle: () => {
        model.setShowAlignment(!model.showAlignment)
      },
    },
    {
      label: 'Show features',
      checked: model.showProteinTracks,
      onToggle: () => {
        model.setShowProteinTracks(!model.showProteinTracks)
      },
    },
    {
      label: 'Auto-scroll alignment',
      checked: model.autoScrollAlignment,
      onToggle: () => {
        model.setAutoScrollAlignment(!model.autoScrollAlignment)
      },
    },
    {
      label: 'Compact tracks',
      checked: model.compactTracks,
      onToggle: () => {
        model.setCompactTracks(!model.compactTracks)
      },
    },
  ]
}

const DisplaySettingsMenu = observer(function DisplaySettingsMenu({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const hasHiddenTracks = model.structures.some(
    s => s.hiddenFeatureTypes.size > 0,
  )
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
        {getDisplayToggles(model).map(toggle => (
          <ToggleMenuItem
            key={toggle.label}
            checked={toggle.checked}
            label={toggle.label}
            onToggle={toggle.onToggle}
          />
        ))}
        {hasHiddenTracks ? (
          <MenuItem
            dense
            onClick={() => {
              for (const structure of model.structures) {
                structure.showAllFeatureTypes()
              }
            }}
          >
            <ListItemText inset>Restore hidden feature tracks</ListItemText>
          </MenuItem>
        ) : null}
      </Menu>
    </>
  )
})

const ProteinViewHeader = observer(function ProteinViewHeader({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const { structures, showAlignment } = model
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
      {showAlignment
        ? structures
            .filter(s => s.pairwiseAlignment || s.alignmentPending)
            .map((structure: JBrowsePluginProteinStructureModel, idx) => (
              <div key={idx}>
                {structure.pairwiseAlignment ? (
                  <ProteinAlignment model={structure} />
                ) : (
                  <LoadingEllipses message="Loading pairwise alignment" />
                )}
              </div>
            ))
        : null}
      <AddStructureDialog model={model} />
    </div>
  )
})

export default ProteinViewHeader
