import SubgraphContextSelect from './SubgraphContextSelect'
import SubgraphHaplotypesField from './SubgraphHaplotypesField'
import GraphSettingsDialog from '../../GraphGenomeView/components/GraphSettingsDialog'

import type { LinearGraphCutModel } from '../model'

export default function GraphTrackSettingsDialog({
  model,
  open,
  onClose,
}: {
  model: LinearGraphCutModel
  open: boolean
  onClose: () => void
}) {
  return (
    <GraphSettingsDialog model={model} open={open} onClose={onClose}>
      <SubgraphContextSelect model={model} />
      <SubgraphHaplotypesField model={model} />
    </GraphSettingsDialog>
  )
}
