import React from 'react'

import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import {
  FOLDSEEK_DATABASES,
  type FoldseekDatabaseId,
} from '../services/foldseekApi'

const useStyles = makeStyles()({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  buttons: {
    display: 'flex',
    gap: 4,
  },
  checkboxGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 0,
  },
})

export default function FoldseekDatabaseSelector({
  selected,
  onChange,
  disabled,
}: {
  selected: FoldseekDatabaseId[]
  onChange: (databases: FoldseekDatabaseId[]) => void
  disabled?: boolean
}) {
  const { classes } = useStyles()

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="subtitle2">Databases to search:</Typography>
        <div className={classes.buttons}>
          <Button
            size="small"
            onClick={() => {
              onChange(FOLDSEEK_DATABASES.map(db => db.id))
            }}
            disabled={disabled}
          >
            Select all
          </Button>
          <Button
            size="small"
            onClick={() => {
              onChange([])
            }}
            disabled={disabled}
          >
            Clear
          </Button>
        </div>
      </div>
      <FormGroup className={classes.checkboxGroup}>
        {FOLDSEEK_DATABASES.map(db => (
          <FormControlLabel
            key={db.id}
            control={
              <Checkbox
                size="small"
                checked={selected.includes(db.id)}
                onChange={() => {
                  if (selected.includes(db.id)) {
                    onChange(selected.filter(id => id !== db.id))
                  } else {
                    onChange([...selected, db.id])
                  }
                }}
                disabled={disabled}
              />
            }
            label={db.label}
          />
        ))}
      </FormGroup>
    </div>
  )
}
