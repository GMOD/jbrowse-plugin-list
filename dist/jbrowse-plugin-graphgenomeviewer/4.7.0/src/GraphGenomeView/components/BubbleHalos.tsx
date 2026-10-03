import { sameBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import {
  BUBBLE_KIND_COLORS,
  BUBBLE_KIND_NAMES,
} from '@jbrowse/bandage-core/bubbles/classifyBubble'
import { HALO_FACTOR } from '@jbrowse/bandage-core/labelLayout'
import { observer } from 'mobx-react'

import { legendBoxStyle, legendRowStyle } from './legendStyles'

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
  const { bubbleHalos, walkLift, hoveredBubble } = model
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
  // lifted walks dim the bubbles none of them enters
  const dimmedBubble = (h: BubbleHalo) =>
    walkLift !== undefined && !h.nodeIds.some(id => walkLift.nodeIds.has(id))

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
              strokeOpacity={
                hoveredBubble && sameBubble(h.bubble, hoveredBubble)
                  ? 0.45
                  : dimmedBubble(h)
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
    </svg>
  )
})

export default BubbleHalos

function HaloSwatch({ color }: { color: string }) {
  return (
    <svg width={18} height={10} style={{ flex: 'none' }}>
      <line
        x1={5}
        y1={5}
        x2={13}
        y2={5}
        stroke={color}
        strokeOpacity={0.35}
        strokeWidth={8}
        strokeLinecap="round"
      />
    </svg>
  )
}

// One row per halo colour on screen, naming the kinds it stands for
export const HaloLegend = observer(function HaloLegend({
  model,
}: {
  model: GraphPaneModel
}) {
  const kindsByColor = new Map<string, Set<string>>()
  for (const h of model.bubbleHalos) {
    if (!h.whole) {
      const color = BUBBLE_KIND_COLORS[h.kind]
      const kinds = kindsByColor.get(color) ?? new Set<string>()
      kinds.add(BUBBLE_KIND_NAMES[h.kind])
      kindsByColor.set(color, kinds)
    }
  }
  return kindsByColor.size > 0 ? (
    <div style={legendBoxStyle} data-testid="graph-halo-legend">
      {[...kindsByColor].map(([color, kinds]) => (
        <div key={color} style={legendRowStyle}>
          <HaloSwatch color={color} />
          <span>bubble: {[...kinds].join(', ')}</span>
        </div>
      ))}
    </div>
  ) : null
})
