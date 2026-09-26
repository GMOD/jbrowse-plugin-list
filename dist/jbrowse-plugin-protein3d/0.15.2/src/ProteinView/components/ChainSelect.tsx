import React from 'react'

import { MenuItem, TextField, Tooltip } from '@mui/material'
import { observer } from 'mobx-react'
import { entityLabel } from 'p2s_mapper'

import type { JBrowsePluginProteinStructureModel } from '../model'

// Which chain the transcript maps to. The structure picks the protein chain
// the transcript explains most of, which cannot separate paralogs in a complex
// or the halves of a chimeric construct, so the choice is exposed for the
// cases it gets wrong.
const ChainSelect = observer(function ChainSelect({
  model,
}: {
  model: JBrowsePluginProteinStructureModel
}) {
  const { entities, mappedEntity, userProvidedTranscriptSequence } = model
  if (!entities || entities.length < 2 || !userProvidedTranscriptSequence) {
    return null
  }
  return (
    <Tooltip
      title="Mapped chain: the one the transcript maps to"
      placement="left"
    >
      <TextField
        select
        size="small"
        variant="standard"
        data-testid="protein-mapped-chain"
        value={model.pendingEntityId ?? mappedEntity?.entityId ?? ''}
        onChange={event => {
          model.chooseEntity(event.target.value)
        }}
        slotProps={{
          input: { disableUnderline: true, sx: { fontSize: 12 } },
          htmlInput: { 'aria-label': 'Mapped chain' },
        }}
        sx={{ minWidth: 60 }}
      >
        {entities.map(entity => (
          <MenuItem key={entity.entityId} value={entity.entityId} dense>
            {entityLabel(entity)}
          </MenuItem>
        ))}
      </TextField>
    </Tooltip>
  )
})

export default ChainSelect
