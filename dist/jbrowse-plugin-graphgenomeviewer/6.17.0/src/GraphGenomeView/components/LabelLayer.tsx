import { bubbleKey } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import { BUBBLE_KIND_COLORS } from '@jbrowse/bandage-core/bubbles/classifyBubble'
import { geneCoverageNote } from '@jbrowse/bandage-core/labelLayout'
import { LABEL_PX } from '@jbrowse/bandage-core/overlayLabels'
import { isAlive } from '@jbrowse/mobx-state-tree'
import { observer } from 'mobx-react'

import { EXON_COLOR } from './GenePins'
import LabelChip from './LabelChip'

import type { GraphPaneModel } from '../model'
import type {
  BubbleHalo,
  RouteLabel,
} from '@jbrowse/bandage-core/bubbles/bubbleHalos'

// Every chip drawn over the graph, above all of its ink: bubble names, gene
// names on their pins, and the routes' walkers. `overlayLabels` has placed
// them against each other and against the row labels already.

const svgStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  overflow: 'hidden' as const,
  zIndex: 3,
}

const GENE_INK = '#1c1c22'

const LabelLayer = observer(function LabelLayer({
  model,
}: {
  model: GraphPaneModel
}) {
  const { bubbles, genes, routes } = model.overlayLabels
  if (bubbles.length + genes.length + routes.length === 0) {
    return null
  }
  const { walkLift, scaleY, translateY, contigThickness } = model
  // lifted walks dim the bubbles none of them enters and the routes none of
  // them takes
  const dimmedBubble = (h: BubbleHalo) =>
    walkLift !== undefined && !h.nodeIds.some(id => walkLift.nodeIds.has(id))
  const dimmedRoute = (r: RouteLabel) =>
    walkLift !== undefined && !r.route.walks.some(w => walkLift.names.has(w))

  return (
    <svg
      style={svgStyle}
      width={model.paneWidth}
      height={model.canvasHeight}
      data-testid="graph-label-layer"
    >
      {genes.map(({ item: pin, x, y, w, text }) => {
        const { gene } = pin
        const note = geneCoverageNote(pin)
        return (
          <g key={`${gene.name}-${gene.start}`}>
            <line
              x1={x}
              x2={x}
              y1={y - LABEL_PX - 2}
              y2={pin.at.y * scaleY + translateY + contigThickness / 2}
              stroke={GENE_INK}
              strokeWidth={0.8}
              strokeOpacity={0.6}
            />
            <LabelChip
              x={x}
              y={y}
              w={w}
              text={gene.name}
              note={text.slice(gene.name.length) || undefined}
              color={GENE_INK}
              edge={EXON_COLOR}
              italic
              title={`${gene.name} ${gene.refName}:${gene.start.toLocaleString()}-${gene.end.toLocaleString()}${note ? `, ${note} in the cut` : ''}`}
              testId="graph-gene-pin-label"
            />
          </g>
        )
      })}
      {routes.map(({ item: { halo: h, route }, x, y, w, text }) => (
        <LabelChip
          key={`${bubbleKey(h.bubble)}-${route.route.steps.join(',')}`}
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
      ))}
      {bubbles.map(({ item: h, x, y, w, text }) => (
        <LabelChip
          key={bubbleKey(h.bubble)}
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
          // a leave also fires as the view closing it unmounts the chip
          onHover={hovered => {
            if (isAlive(model)) {
              model.setHoveredBubble(hovered ? h.bubble : null)
            }
          }}
        />
      ))}
    </svg>
  )
})

export default LabelLayer
