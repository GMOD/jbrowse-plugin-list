import React from 'react'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  MenuList,
  Typography,
} from '@mui/material'

interface LaunchOption {
  // also the suffix of the row's data-testid, so a test or a screenshot spec
  // names the launch it wants ('3d', '1d', 'msa', '3d-msa') rather than
  // matching the row's title text. Which options are present depends on the
  // session (1D needs one it can add tracks to) and on whether msaview is
  // loaded, so an index would not be stable either.
  key: string
  title: string
  description: string
  onClick: () => void
}

export default function LaunchOptionsDialog({
  open,
  onClose,
  options,
}: {
  open: boolean
  onClose: () => void
  options: LaunchOption[]
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="protein-launch-options-dialog"
    >
      <DialogTitle>Launch options</DialogTitle>
      <DialogContent>
        <MenuList>
          {options.map(opt => (
            <MenuItem
              key={opt.key}
              data-testid={`protein-launch-option-${opt.key}`}
              onClick={opt.onClick}
            >
              <div>
                <Typography variant="body1">{opt.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {opt.description}
                </Typography>
              </div>
            </MenuItem>
          ))}
        </MenuList>
      </DialogContent>
    </Dialog>
  )
}
