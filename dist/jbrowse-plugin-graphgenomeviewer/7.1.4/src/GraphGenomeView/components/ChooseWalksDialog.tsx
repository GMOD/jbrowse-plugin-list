import { observer } from 'mobx-react'

import PickNamesDialog from './PickNamesDialog'

import type { GraphPaneModel } from '../model'

type WalkPicker = Pick<
  GraphPaneModel,
  'walkChoices' | 'walkLayers' | 'walkLabel' | 'liftWalks'
>

// Which haplotypes to highlight, for a graph with more walks than a menu can
// list
const ChooseWalksDialog = observer(function ChooseWalksDialog({
  model,
  onClose,
}: {
  model: WalkPicker
  onClose: () => void
}) {
  const { walkChoices } = model
  return (
    <PickNamesDialog
      title="Choose haplotypes"
      label="Haplotypes"
      testId="graph-choose-walks"
      caption={`${walkChoices.length.toLocaleString()} haplotypes in this cut. The ones picked are highlighted in this order, and the rest fades.`}
      options={walkChoices.map(c => c.name)}
      initial={model.walkLayers.map(l => l.walk)}
      optionLabel={name => model.walkLabel(name)}
      confirmLabel={picked =>
        picked.length > 0 ? 'Highlight these' : 'Clear highlights'
      }
      onPick={picked => {
        model.liftWalks(picked)
      }}
      onClose={onClose}
    />
  )
})

export default ChooseWalksDialog
