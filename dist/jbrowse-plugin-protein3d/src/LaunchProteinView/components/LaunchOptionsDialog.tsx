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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Launch options</DialogTitle>
      <DialogContent>
        <MenuList>
          {options.map(opt => (
            <MenuItem key={opt.key} onClick={opt.onClick}>
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
