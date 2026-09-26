import { observer } from 'mobx-react'

import LabelChip from './LabelChip'
import { LABEL_CHAR_PX, placeLabels } from './overlayLabels'
import { BUBBLE_KIND_COLORS } from '../bubbles/classifyBubble'

import type { LabelCandidate } from './overlayLabels'
import type { BubbleHalo, RouteLabel } from '../bubbles/bubbleHalos'
import type { GraphGenomeViewModel } from '../model'

// The bubbles over a node drawing: each a translucent halo along its nodes,
// drawn once in layout units and moved with the canvas by one transform, a
// label at its highest node that opens the bubble, and a chip on each route
// the walks take through it naming who takes it. The halo itself takes no
// pointer events, so the nodes under it still hover and drag.

const svgStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  overflow: 'hidden' as const,
  zIndex: 2,
}

const HALO_FACTOR = 3.4
const LEGEND_CORNER_PX = 240
// routes whose own stretches are drawn on top of each other stack their chips
const ROUTE_STACK = 8

const BubbleHalos = observer(function BubbleHalos({
  model,
}: {
  model: GraphGenomeViewModel
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
    width,
    canvasHeight,
    contigThickness,
  } = model
  const halo = contigThickness * HALO_FACTOR
  const screen = (p: { x: number; y: number }) => ({
    x: p.x * scaleX + translateX,
    y: p.y * scaleY + translateY,
  })
  // a lifted walk dims the bubbles it never enters and the routes it does not
  // take, halo and chip alike
  const dimmedBubble = (h: BubbleHalo) =>
    walkHighlight !== undefined &&
    !h.nodeIds.some(id => walkHighlight.nodeIds.has(id))
  const dimmedRoute = (r: RouteLabel) =>
    walkHighlight !== undefined && !r.route.walks.includes(walkHighlight.name)

  // the legends own the top-right corner, and the Back button of a popped
  // graph the top-left
  const reserved = [{ x0: width - LEGEND_CORNER_PX, x1: width, y0: 0, y1: 60 }]
  if (model.poppedFrom) {
    reserved.push({
      x0: 0,
      x1: 60 + model.poppedFrom.label.length * LABEL_CHAR_PX * 1.2,
      y0: 0,
      y1: 44,
    })
  }
  // bubble labels place first, biggest bubble first, above the halo; route
  // chips place after them, on the far point of their loops
  const byBubble = [...bubbleHalos].sort((a, b) => b.members - a.members)
  const candidates: LabelCandidate<{ halo: BubbleHalo; route?: RouteLabel }>[] =
    [
      ...byBubble.map(h => {
        const { x, y } = screen(h.top)
        return { item: { halo: h }, x, y: y - halo / 2 - 6, text: h.label }
      }),
      ...byBubble.flatMap(h =>
        h.routes.map(r => {
          const { x, y } = screen(r.at)
          return {
            item: { halo: h, route: r },
            x,
            y: y + 4,
            text: r.text,
            stack: ROUTE_STACK,
          }
        }),
      ),
    ]
  const labels = placeLabels(
    candidates,
    { width, height: canvasHeight },
    reserved,
  )

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
      {labels.map(({ item: { halo: h, route }, x, y, w, text }) =>
        route ? (
          <LabelChip
            key={`${h.bubble.start}-${h.bubble.end}-${route.route.steps.join(',')}`}
            x={x}
            y={y}
            w={w}
            text={text}
            color={BUBBLE_KIND_COLORS[h.kind]}
            small
            dimmed={dimmedRoute(route)}
            title={`${route.route.walks.length} walk(s): ${route.route.walks.join(', ')}`}
            testId="graph-route-label"
          />
        ) : (
          <LabelChip
            key={`${h.bubble.start}-${h.bubble.end}-label`}
            x={x}
            y={y}
            w={w}
            text={text}
            color={BUBBLE_KIND_COLORS[h.kind]}
            dimmed={dimmedBubble(h)}
            title={`${h.label}\n${h.bubble.segmentCount} segments · click to open`}
            testId="graph-bubble-halo-label"
            onClick={() => {
              void model.popBubble(h.bubble)
            }}
          />
        ),
      )}
    </svg>
  )
})

export default BubbleHalos
