import React, { lazy, useState } from 'react'

import { LoadingEllipses } from '@jbrowse/core/ui'
import { getSession } from '@jbrowse/core/util'
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

import { ColorKey, MolstarLegendKey } from './ColorKey'
import HeaderStructureRows from './HeaderStructureRow'
import ProteinAlignment from './ProteinAlignment'
import ProteinAlignmentHelpButton from './ProteinAlignmentHelpButton'
import {
  COLOR_FIELDS,
  DEFAULT_COLOR_LABEL,
  colorLabelOf,
} from '../proteinColor'

import type { JBrowsePluginProteinViewModel } from '../model'
import type { ColorField } from '../proteinColor'

const GenomeTrackColorDialog = lazy(() => import('./GenomeTrackColorDialog'))

// `values` takes numbers, which only a session can give
const COLOR_CHOICES: { field?: ColorField; label: string }[] = [
  { label: DEFAULT_COLOR_LABEL },
  ...Object.entries(COLOR_FIELDS)
    .filter(([field]) => field !== 'values')
    .map(([field, { label }]) => ({
      field: field as ColorField,
      label: field === 'track' ? `${label}...` : label,
    })),
]

// An icon rather than a select showing the field's name, which took the
// width of a structure's coverage line on every row beside it
const ColorMenu = observer(function ColorMenu({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const title = `Color by: ${colorLabelOf(model.color)}`
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
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null)
        }}
      >
        {COLOR_CHOICES.map(({ field, label }) => (
          <MenuItem
            key={label}
            dense
            selected={field === model.color.field}
            onClick={() => {
              if (field === 'track') {
                getSession(model).queueDialog(handleClose => [
                  GenomeTrackColorDialog,
                  { model, handleClose },
                ])
              } else if (field !== model.color.field) {
                model.setColor(field ? { field } : {})
              }
              setAnchorEl(null)
            }}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
})

function ToggleMenuItem({
  checked,
  label,
  disabled,
  onToggle,
}: {
  checked: boolean
  label: string
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <MenuItem
      onClick={() => {
        onToggle()
      }}
      disabled={disabled}
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
            key={toggle.key}
            checked={toggle.checked}
            label={toggle.label}
            disabled={toggle.disabled}
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
  const {
    alignmentStructure,
    showAlignment,
    colorLegend,
    colorLegendTitle,
    domainLegend,
  } = model
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
          <ColorMenu model={model} />
          <DisplaySettingsMenu model={model} />
          <ProteinAlignmentHelpButton model={model} />
        </div>
      </div>
      {domainLegend ? (
        domainLegend.map(group => (
          <ColorKey
            key={group.title}
            title={group.title}
            entries={group.entries}
            testId="structure-legend"
          />
        ))
      ) : colorLegend ? (
        <MolstarLegendKey title={colorLegendTitle} legend={colorLegend} />
      ) : null}
      {showAlignment && alignmentStructure?.pairwiseAlignment ? (
        <ProteinAlignment model={alignmentStructure} />
      ) : showAlignment && alignmentStructure?.alignmentPending ? (
        <LoadingEllipses message="Loading pairwise alignment" />
      ) : null}
    </div>
  )
})

export default ProteinViewHeader
