import React from 'react'

import { Checkbox, Divider, ListItemText, Menu, MenuItem } from '@mui/material'

interface LaunchOption {
  // also the suffix of the row's data-testid, so a test or a screenshot spec
  // names the launch it wants ('3d', '1d') rather than matching the row's title
  // text. Which options are present depends on the session (1D needs one it can
  // add tracks to), so an index would not be stable either.
  key: string
  title: string
  description: string
  onClick: () => void
}

export default function LaunchOptionsMenu({
  anchorEl,
  onClose,
  options,
  sideBySide,
  onSideBySideChange,
}: {
  anchorEl: HTMLElement | null
  onClose: () => void
  options: LaunchOption[]
  sideBySide: boolean
  onSideBySideChange: (value: boolean) => void
}) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      data-testid="protein-launch-options-menu"
    >
      {options.map(opt => (
        <MenuItem
          key={opt.key}
          data-testid={`protein-launch-option-${opt.key}`}
          onClick={opt.onClick}
        >
          <ListItemText primary={opt.title} secondary={opt.description} />
        </MenuItem>
      ))}
      <Divider />
      {/* How the launch places the view, beside the launches themselves: it is
          a choice about this launch, and behind a gear icon nobody found it. */}
      <MenuItem
        data-testid="protein-launch-side-by-side"
        onClick={() => {
          onSideBySideChange(!sideBySide)
        }}
      >
        <Checkbox checked={sideBySide} size="small" />
        <ListItemText
          primary="Open side by side"
          secondary="Place the protein view right of the genome view instead of below it"
        />
      </MenuItem>
    </Menu>
  )
}
