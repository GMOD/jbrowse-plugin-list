import { observer } from 'mobx-react'

import PickNamesDialog from './PickNamesDialog'

import type { GraphPaneModel } from '../model'

type SamplePicker = Pick<
  GraphPaneModel,
  'walkRowSampleChoices' | 'walkRowSamples' | 'setWalkRowSamples'
>

// Which samples' walks walk rows show
const ChooseSamplesDialog = observer(function ChooseSamplesDialog({
  model,
  onClose,
}: {
  model: SamplePicker
  onClose: () => void
}) {
  const { samples } = model.walkRowSampleChoices
  return (
    <PickNamesDialog
      title="Choose samples"
      label="Samples"
      testId="graph-choose-samples"
      caption={`${samples.length.toLocaleString()} samples in this cut. Their walks show in pairs, in the order picked.`}
      options={samples}
      initial={model.walkRowSamples ?? []}
      confirmLabel={picked =>
        picked.length > 0 ? 'Show these samples' : 'Show every sample'
      }
      onPick={picked => {
        model.setWalkRowSamples(picked.length > 0 ? picked : undefined)
      }}
      onClose={onClose}
    />
  )
})

export default ChooseSamplesDialog
