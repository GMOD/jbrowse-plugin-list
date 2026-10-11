import { bubbleKey, sameBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import {
  BUBBLE_KIND_COLORS,
  BUBBLE_KIND_NAMES,
} from '@jbrowse/bandage-core/bubbles/classifyBubble'
import { HALO_FACTOR } from '@jbrowse/bandage-core/labelLayout'
import { observer } from 'mobx-react'

import { legendBoxStyle, legendRowStyle } from './legendStyles'

import type { GraphPaneModel } from '../model'

// The bubbles over a node drawing: each a translucent halo along its nodes,
// drawn once in layout units and moved with the canvas by one transform. The
// halo takes no pointer events, so the nodes under it still hover and drag;
// its name and its routes' chips are LabelLayer's. A small variant is
// LabelLayer's tick, and shows its halo only while hovered.

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
  const { bubbleHalos, hoveredBubble } = model
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

// One key entry per halo colour drawn, naming the kinds it stands for; the
// screen's legend and the exported figure's both read it
export function haloKeyEntries(model: GraphPaneModel) {
  const kindsByColor = new Map<string, Set<string>>()
  for (const h of model.bubbleHalos) {
    if (!h.whole) {
      const color = BUBBLE_KIND_COLORS[h.kind]
      const kinds = kindsByColor.get(color) ?? new Set<string>()
      kinds.add(BUBBLE_KIND_NAMES[h.kind])
      kindsByColor.set(color, kinds)
    }
  }
  return [...kindsByColor].map(([color, kinds]) => ({
    color,
    label: `bubble: ${[...kinds].join(', ')}`,
  }))
}

export const HaloLegend = observer(function HaloLegend({
  model,
}: {
  model: GraphPaneModel
}) {
  const entries = haloKeyEntries(model)
  return entries.length > 0 ? (
    <div style={legendBoxStyle} data-testid="graph-halo-legend">
      {entries.map(({ color, label }) => (
        <div key={color} style={legendRowStyle}>
          <HaloSwatch color={color} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  ) : null
})

const closeStyle = {
  pointerEvents: 'auto' as const,
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  padding: '0 2px',
  font: 'inherit',
  textDecoration: 'underline',
}

// What the colour is on while a bubble is open, and the way back out
export const OpenBubbleLegend = observer(function OpenBubbleLegend({
  model,
}: {
  model: GraphPaneModel
}) {
  const open = model.openBubble
  const halo = open
    ? model.bubbleHalos.find(h => sameBubble(h.bubble, open))
    : undefined
  return open ? (
    <div style={legendBoxStyle} data-testid="graph-open-bubble-legend">
      <div style={legendRowStyle}>
        {halo ? <HaloSwatch color={BUBBLE_KIND_COLORS[halo.kind]} /> : null}
        <span>open: {halo?.label ?? 'bubble'}</span>
        <button
          type="button"
          style={closeStyle}
          data-testid="graph-close-bubble"
          onClick={() => {
            model.closeBubbles()
          }}
        >
          close
        </button>
      </div>
    </div>
  ) : null
})
