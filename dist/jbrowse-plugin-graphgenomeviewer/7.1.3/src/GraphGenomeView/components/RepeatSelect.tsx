import { observer } from 'mobx-react'

import LabelledSelect from './LabelledSelect'

import type { GraphPaneModel } from '../model'

// Which tandem repeat array walk rows slice each walk by and tile, or the
// whole window
const RepeatSelect = observer(function RepeatSelect({
  model,
}: {
  model: GraphPaneModel
}) {
  const { repeatChoices } = model
  if (model.chosenLayoutMode !== 'walkrows' || repeatChoices.length === 0) {
    return null
  }
  return (
    <LabelledSelect
      label="Repeat"
      size="small"
      sx={{ minWidth: 130, maxWidth: 260 }}
      testId="graph-repeat-select"
      value={model.selectedRepeat?.key ?? ''}
      options={[
        { value: '', label: 'Whole window' },
        ...repeatChoices.map(({ key, name, unit }) => ({
          value: key,
          label: `${name} · ${unit.toLocaleString()} bp unit`,
        })),
      ]}
      onChange={key => {
        model.setRepeatKey(key)
      }}
    />
  )
})

export default RepeatSelect
