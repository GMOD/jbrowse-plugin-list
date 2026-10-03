import { observer } from 'mobx-react'

import type { GraphPaneModel } from '../model'

const svgStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  overflow: 'visible' as const,
  zIndex: 4,
}

// A ring round the node a point on the walk strip lights, so a one-bp node
// can be found in a hairball
const WalkStripLocator = observer(function WalkStripLocator({
  model,
}: {
  model: GraphPaneModel
}) {
  const at = model.walkStripLocator
  return at ? (
    <svg
      style={svgStyle}
      width={model.paneWidth}
      height={model.canvasHeight}
      data-testid="graph-walk-strip-locator"
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
    </svg>
  ) : null
})

export default WalkStripLocator
