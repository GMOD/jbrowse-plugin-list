import { observer } from 'mobx-react'

import { PaneSvgLayer } from './PaneLayer'

import type { GraphPaneModel } from '../model'

// A ring round the node a point on the walk strip lights, so a one-bp node
// can be found in a hairball
const WalkStripLocator = observer(function WalkStripLocator({
  model,
}: {
  model: GraphPaneModel
}) {
  const at = model.walkStripLocator
  return at ? (
    <PaneSvgLayer
      model={model}
      zIndex={4}
      overflow="visible"
      testId="graph-walk-strip-locator"
    >
      <circle
        cx={at.x}
        cy={at.y}
        r={11}
        fill="none"
        stroke="white"
        strokeWidth={4}
      />
      <circle
        cx={at.x}
        cy={at.y}
        r={11}
        fill="none"
        stroke="#111"
        strokeWidth={1.75}
      />
    </PaneSvgLayer>
  ) : null
})

export default WalkStripLocator
