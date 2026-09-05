import React from 'react'

import { MenuItem, TextField } from '@mui/material'
import { observer } from 'mobx-react'

import { entityLabel } from '../extractStructureSequences'

import type { JBrowsePluginProteinStructureModel } from '../model'

// Which chain the transcript maps to. The structure picks one by alignment
// score, which cannot separate paralogs in a complex or the halves of a
// chimeric construct, so the choice is exposed for the cases it gets wrong.
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
    <TextField
      select
      size="small"
      label="Mapped chain"
      data-testid="protein-mapped-chain"
      value={mappedEntity?.entityId ?? ''}
      onChange={event => {
        try {
          model.chooseEntity(event.target.value)
        } catch (e) {
          console.error(e)
          model.setError(e)
        }
      }}
      sx={{ minWidth: 200, mr: 1 }}
    >
      {entities.map(entity => (
        <MenuItem key={entity.entityId} value={entity.entityId}>
          {entityLabel(entity)}
        </MenuItem>
      ))}
    </TextField>
  )
})

export default ChainSelect
