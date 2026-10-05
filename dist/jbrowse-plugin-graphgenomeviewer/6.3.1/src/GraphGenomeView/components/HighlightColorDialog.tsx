import { WALK_FIELDS, WALK_SCHEMES } from '@jbrowse/bandage-core/walkEncoding'
import { Dialog } from '@jbrowse/core/ui'
import {
  Button,
  DialogActions,
  DialogContent,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'

import type { GraphPaneModel } from '../model'

type HighlightColors = Pick<
  GraphPaneModel,
  'drawnWalks' | 'walkLabel' | 'setWalkColor'
>

const HighlightColorDialog = observer(function HighlightColorDialog({
  model,
  onClose,
}: {
  model: HighlightColors
  onClose: () => void
}) {
  return (
    <Dialog open onClose={onClose} title="Color highlighted haplotypes">
      <DialogContent
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr 1fr',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Typography variant="subtitle2">Haplotype</Typography>
        <Typography variant="subtitle2">Color by</Typography>
        <Typography variant="subtitle2">Palette</Typography>
        {model.drawnWalks.map(({ name, encoding }) => (
          <Row
            key={name}
            label={model.walkLabel(name)}
            field={encoding.field}
            scheme={encoding.scheme}
            onField={field => {
              model.setWalkColor(name, { field })
            }}
            onScheme={scheme => {
              model.setWalkColor(name, { scheme })
            }}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
})

type Field = (typeof WALK_FIELDS)[number]['value']
type Scheme = (typeof WALK_SCHEMES)[number]['value']

function Row({
  label,
  field,
  scheme,
  onField,
  onScheme,
}: {
  label: string
  field: Field
  scheme: Scheme
  onField: (field: Field) => void
  onScheme: (scheme: Scheme) => void
}) {
  return (
    <>
      <Typography variant="body2">{label}</Typography>
      <TextField
        select
        size="small"
        value={field}
        onChange={e => {
          onField(e.target.value as Field)
        }}
      >
        {WALK_FIELDS.map(f => (
          <MenuItem key={f.value} value={f.value}>
            {f.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        value={scheme}
        onChange={e => {
          onScheme(e.target.value as Scheme)
        }}
      >
        {WALK_SCHEMES.filter(
          s => s.value !== 'rainbow' || field === 'reference',
        ).map(s => (
          <MenuItem key={s.value} value={s.value}>
            {s.label}
          </MenuItem>
        ))}
      </TextField>
    </>
  )
}

export default HighlightColorDialog
