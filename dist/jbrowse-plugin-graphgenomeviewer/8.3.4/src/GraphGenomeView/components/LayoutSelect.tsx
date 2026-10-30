import { LAYOUT_MODES } from '@jbrowse/bandage-core/layoutModes'
import { observer } from 'mobx-react'

import LabelledSelect from './LabelledSelect'

import type { GraphPaneModel } from '../model'

const LayoutSelect = observer(function LayoutSelect({
  model,
}: {
  model: GraphPaneModel
}) {
  const { graph } = model
  return (
    <LabelledSelect
      label="Layout"
      size="small"
      sx={{ minWidth: 140 }}
      testId="graph-layout-select"
      value={model.chosenLayoutMode}
      options={LAYOUT_MODES.map(({ value, label, description, available }) => ({
        value,
        label,
        description,
        disabled: graph ? !available(graph) : false,
      }))}
      onChange={mode => {
        void model.switchLayout(mode)
      }}
    />
  )
})

export default LayoutSelect
