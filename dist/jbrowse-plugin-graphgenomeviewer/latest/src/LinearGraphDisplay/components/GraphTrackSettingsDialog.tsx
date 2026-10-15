import SubgraphContextSelect from './SubgraphContextSelect'
import SubgraphHaplotypesField from './SubgraphHaplotypesField'
import GraphSettingsDialog from '../../GraphGenomeView/components/GraphSettingsDialog'

import type { LinearGraphCutModel } from '../model'

export default function GraphTrackSettingsDialog({
  model,
  onClose,
}: {
  model: LinearGraphCutModel
  onClose: () => void
}) {
  return (
    <GraphSettingsDialog model={model} onClose={onClose}>
      <SubgraphContextSelect model={model} />
      <SubgraphHaplotypesField model={model} />
    </GraphSettingsDialog>
  )
}
