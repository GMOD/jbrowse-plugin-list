import { BUBBLE_KIND_COLORS } from '@jbrowse/bandage-core/bubbles/classifyBubble'
import { HALO_FACTOR } from '@jbrowse/bandage-core/labelLayout'
import { observer } from 'mobx-react'

import type { GraphPaneModel } from '../model'
import type { BubbleHalo } from '@jbrowse/bandage-core/bubbles/bubbleHalos'

// The bubbles over a node drawing: each a translucent halo along its nodes,
// drawn once in layout units and moved with the canvas by one transform. The
// halo takes no pointer events, so the nodes under it still hover and drag;
// its name and its routes' chips are LabelLayer's.

const svgStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  overflow: 'hidden' as const,
  zIndex: 2,
}

const BubbleHalos = observer(function BubbleHalos({
  model,
}: {
  model: GraphPaneModel
}) {
  const { bubbleHalos, walkHighlight } = model
  if (bubbleHalos.length === 0) {
    return null
  }
  const {
    scaleX,
    scaleY,
    translateX,
    translateY,
    paneWidth: width,
    canvasHeight,
  } = model
  const halo = model.contigThickness * HALO_FACTOR
  // a lifted walk dims the bubbles it never enters
  const dimmedBubble = (h: BubbleHalo) =>
    walkHighlight !== undefined &&
    !h.nodeIds.some(id => walkHighlight.nodeIds.has(id))

  return (
    <svg
      style={svgStyle}
      width={width}
      height={canvasHeight}
      data-testid="graph-bubble-halos"
    >
      <g
        transform={`translate(${translateX} ${translateY}) scale(${scaleX} ${scaleY})`}
      >
        {bubbleHalos
          .filter(h => !h.whole)
          .map(h => (
            <path
              key={`${h.bubble.start}-${h.bubble.end}`}
              d={h.path}
              fill="none"
              stroke={BUBBLE_KIND_COLORS[h.kind]}
              strokeOpacity={dimmedBubble(h) ? 0.06 : 0.22}
              strokeWidth={halo}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
      </g>
    </svg>
  )
})

export default BubbleHalos
