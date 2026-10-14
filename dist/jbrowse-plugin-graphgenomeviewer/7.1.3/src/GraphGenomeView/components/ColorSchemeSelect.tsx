import { COLOR_SCHEMES } from '@jbrowse/bandage-core/colorSchemes'
import { observer } from 'mobx-react'

import LabelledSelect from './LabelledSelect'

import type { GraphPaneModel } from '../model'

const ColorSchemeSelect = observer(function ColorSchemeSelect({
  model,
}: {
  model: GraphPaneModel
}) {
  const fixed = model.colorSchemeLock
  return (
    <LabelledSelect
      label="Color"
      size="small"
      sx={{ minWidth: 100 }}
      disabled={fixed !== undefined}
      title={fixed?.why}
      shown={fixed?.value}
      value={model.chosenColorScheme}
      options={COLOR_SCHEMES}
      onChange={scheme => {
        model.setColorScheme(scheme)
      }}
    />
  )
})

export default ColorSchemeSelect
