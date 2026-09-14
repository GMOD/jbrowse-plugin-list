import React from 'react'

import { ListItemText, Menu, MenuItem } from '@mui/material'

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
}: {
  anchorEl: HTMLElement | null
  onClose: () => void
  options: LaunchOption[]
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
    </Menu>
  )
}
