import { useId } from 'react'

import {
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material'

import type { SxProps } from '@mui/material'

export interface SelectOption<T extends string> {
  value: T
  label: string
  // an option's tooltip, and the reason under a disabled one, whose tooltip
  // cannot open
  description?: string
  disabled?: boolean
}

// One dropdown with its label tied to it, so a screen reader names the combobox
export default function LabelledSelect<T extends string>({
  label,
  value,
  options,
  testId,
  size,
  sx,
  disabled,
  title,
  shown,
  onChange,
}: {
  label: string
  value: T
  options: readonly SelectOption<T>[]
  testId?: string
  size?: 'small' | 'medium'
  sx?: SxProps
  disabled?: boolean
  title?: string
  // what the closed select reads, when not the picked option's label
  shown?: string
  onChange: (value: T) => void
}) {
  const labelId = useId()
  return (
    <FormControl size={size} sx={sx} disabled={disabled} title={title}>
      <InputLabel id={labelId} shrink>
        {label}
      </InputLabel>
      <Select
        labelId={labelId}
        value={value}
        label={label}
        notched
        displayEmpty
        data-testid={testId}
        renderValue={picked =>
          shown ?? options.find(o => o.value === picked)?.label ?? picked
        }
        onChange={e => {
          onChange(e.target.value as T)
        }}
      >
        {options.map(o => (
          <MenuItem
            key={o.value}
            value={o.value}
            disabled={o.disabled}
            title={o.disabled ? undefined : o.description}
          >
            <ListItemText
              primary={o.label}
              secondary={o.disabled ? o.description : undefined}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
