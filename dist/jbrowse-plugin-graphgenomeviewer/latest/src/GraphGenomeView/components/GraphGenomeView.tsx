import { observer } from 'mobx-react'

import GraphCanvas from './GraphCanvas'
import GraphLoadStatus from './GraphLoadStatus'
import ImportForm from './ImportForm'

import type { GraphGenomeViewModel } from '../model'

const GraphGenomeView = observer(function GraphGenomeView({
  model,
}: {
  model: GraphGenomeViewModel
}) {
  if (model.hasGraph) {
    return <GraphCanvas model={model} />
  }
  // A launched or restored view has a source of its own, so the import form
  // has nothing to offer it when that source fails
  if (model.canRetryLoad && (model.error || model.loadCanceled)) {
    return <GraphLoadStatus model={model} />
  }
  // Hidden rather than unmounted, so a typed URL survives a failed load
  return (
    <>
      {model.isLoading ? <GraphLoadStatus model={model} /> : null}
      <div hidden={model.isLoading}>
        <ImportForm model={model} />
      </div>
    </>
  )
})

export default GraphGenomeView
