import React from 'react'

import { LoadingEllipses } from '@jbrowse/core/ui'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { observer } from 'mobx-react'

import AddStructureDialog from './AddStructureDialog'
import HeaderStructureInfo from './HeaderStructureInfo'
import ProteinAlignment from './ProteinAlignment'

import type {
  JBrowsePluginProteinStructureModel,
  JBrowsePluginProteinViewModel,
} from '../model'

function ToggleCheckbox({
  checked,
  label,
  onToggle,
}: {
  checked: boolean
  label: string
  onToggle: () => void
}) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={() => {
            onToggle()
          }}
          size="small"
        />
      }
      label={label}
    />
  )
}

const ProteinViewHeader = observer(function ProteinViewHeader({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const { structures, showAlignment, showProteinTracks, autoScrollAlignment } =
    model
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <HeaderStructureInfo model={model} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <ToggleCheckbox
            checked={showAlignment}
            label="Show alignment"
            onToggle={() => {
              model.setShowAlignment(!showAlignment)
            }}
          />
          <ToggleCheckbox
            checked={showProteinTracks}
            label="Show features"
            onToggle={() => {
              model.setShowProteinTracks(!showProteinTracks)
            }}
          />
          <ToggleCheckbox
            checked={autoScrollAlignment}
            label="Auto-scroll features"
            onToggle={() => {
              model.setAutoScrollAlignment(!autoScrollAlignment)
            }}
          />
        </div>
      </div>
      {showAlignment
        ? structures.map((structure: JBrowsePluginProteinStructureModel, idx) => (
            <div key={idx}>
              {structure.pairwiseAlignment ? (
                <ProteinAlignment model={structure} />
              ) : (
                <LoadingEllipses message="Loading pairwise alignment" />
              )}
            </div>
          ))
        : null}
      <AddStructureDialog model={model} />
    </div>
  )
})

export default ProteinViewHeader
