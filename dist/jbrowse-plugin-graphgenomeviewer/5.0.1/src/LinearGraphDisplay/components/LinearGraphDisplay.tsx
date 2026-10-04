import { DisplayStatusChrome } from '@jbrowse/display-kit/DisplayChrome'
import { observer } from 'mobx-react'

import GraphCanvas from '../../GraphGenomeView/components/GraphCanvas'
import HaplotypeOverviewCanvas from '../../HaplotypeOverview/HaplotypeOverviewCanvas'

import type { LinearGraphDisplayModel } from '../model'

const LinearGraphDisplay = observer(function LinearGraphDisplay({
  model,
}: {
  model: LinearGraphDisplayModel
}) {
  return (
    <DisplayStatusChrome
      model={model}
      phase={model.displayPhase}
      drawn={
        model.showsOverview
          ? model.overview !== undefined &&
            model.overviewPainted === model.overview
          : model.painted && model.geometryPainted
      }
      testid="linear-graph-display"
      data-layout={model.chosenLayoutMode}
      data-cut-tier={model.cutTier}
      data-recuts={model.recuts}
      data-node-count={model.hasGraph ? model.nodeCount : undefined}
      data-loading={model.isLoading ? '' : undefined}
      style={{
        width: model.paneWidth,
        height: model.height,
        overflow: 'hidden',
      }}
    >
      {model.showsOverview ? (
        <HaplotypeOverviewCanvas model={model} />
      ) : (
        <GraphCanvas model={model} ownChrome={false} />
      )}
    </DisplayStatusChrome>
  )
})

export default LinearGraphDisplay
