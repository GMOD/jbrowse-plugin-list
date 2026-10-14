import { bubbleKey, sameBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import { BUBBLE_KIND_COLORS } from '@jbrowse/bandage-core/bubbles/classifyBubble'
import { HALO_FACTOR } from '@jbrowse/bandage-core/labelLayout'
import { observer } from 'mobx-react'

import { PaneSvgLayer } from './PaneLayer'

import type { GraphPaneModel } from '../model'

// The bubbles over a node drawing: each a translucent halo along its nodes,
// drawn once in layout units and moved with the canvas by one transform. The
// halo takes no pointer events, so the nodes under it still hover and drag;
// its name and its routes' chips are LabelLayer's. A small variant is
// LabelLayer's tick, and shows its halo only while hovered.

const BubbleHalos = observer(function BubbleHalos({
  model,
}: {
  model: GraphPaneModel
}) {
  const { bubbleHalos, hoveredBubble } = model
  if (bubbleHalos.length === 0) {
    return null
  }
  const { scaleX, scaleY, translateX, translateY } = model
  const halo = model.contigThickness * HALO_FACTOR
  return (
    <PaneSvgLayer model={model} zIndex={2} testId="graph-bubble-halos">
      <g
        transform={`translate(${translateX} ${translateY}) scale(${scaleX} ${scaleY})`}
      >
        {bubbleHalos
          .filter(
            h =>
              !h.whole &&
              (!h.tick ||
                (hoveredBubble && sameBubble(h.bubble, hoveredBubble))),
          )
          .map(h => (
            <path
              key={bubbleKey(h.bubble)}
              d={h.path}
              fill="none"
              stroke={BUBBLE_KIND_COLORS[h.kind]}
              strokeOpacity={
                hoveredBubble && sameBubble(h.bubble, hoveredBubble)
                  ? 0.45
                  : model.bubbleFaded(h)
                    ? 0.06
                    : 0.22
              }
              strokeWidth={halo}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
      </g>
    </PaneSvgLayer>
  )
})

export default BubbleHalos
