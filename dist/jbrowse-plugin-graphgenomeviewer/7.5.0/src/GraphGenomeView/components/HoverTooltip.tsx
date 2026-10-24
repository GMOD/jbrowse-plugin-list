import type { ReactNode } from 'react'

import { edgeHoverText, regionLabel } from '@jbrowse/bandage-core/hoverText'
import { observer } from 'mobx-react'

import { nodeOwnLocation } from '../../launchFromGraph/contributors'
import { TOOLTIP_INSET_PX } from '../pane/fitViews'

import type { chipReadoutAt } from './LabelLayer'
import type { GraphPaneModel } from '../model'

// Bottom right of the canvas, clear of the row labels on the left edge and of
// a walk strip under the canvas. Where the legend reaches down to it, it moves
// left of the legend.
const tooltipStyle = {
  position: 'absolute' as const,
  bottom: TOOLTIP_INSET_PX,
  lineHeight: 'normal',
  background: 'rgba(0,0,0,0.75)',
  color: 'white',
  padding: '4px 8px',
  borderRadius: 4,
  fontSize: 12,
  pointerEvents: 'none' as const,
  zIndex: 6,
}

type Readout = NonNullable<ReturnType<typeof chipReadoutAt>>

function labelled({ label, readout }: Readout) {
  return (
    <>
      <strong>{label}</strong> — {readout}
    </>
  )
}

// What the pointer is on, the most specific first: a gene chip, a node, an
// edge, then a walk row or a tube
function hoverTip(
  model: GraphPaneModel,
  chip: Readout | undefined,
): { testId?: string; body: ReactNode } | undefined {
  if (chip) {
    return { testId: 'graph-chip-tooltip', body: labelled(chip) }
  }
  const node = model.hoveredNode
    ? model.hoverNodeById?.get(model.hoveredNode)
    : undefined
  if (node) {
    const merged = model.hoverDrawing?.members.get(node.id)
    const own = nodeOwnLocation(node)
    return {
      body: (
        <>
          <strong>{node.name}</strong>
          {merged ? ` and ${merged.length - 1} more` : ''} —{' '}
          {node.length.toLocaleString()} bp, depth {node.depth.toFixed(1)}
          {/* the assembly that contributed the segment, and where on it */}
          {own ? (
            <>
              <br />
              {own.sample} {regionLabel(own)} (rank {node.stable?.rank})
            </>
          ) : null}
        </>
      ),
    }
  }
  const edge =
    model.hoveredEdge === null
      ? undefined
      : model.graph?.edges[model.hoveredEdge]
  if (edge) {
    const text = edgeHoverText(
      edge,
      model.deletions.find(d => d.edgeIndex === model.hoveredEdge),
      id => model.nodeById?.get(id)?.name ?? id,
    )
    // a deletion edge skips backbone that some haplotype lacks, so its
    // readout gives the bp skipped
    return {
      body: text.deletion ? (
        <>
          <strong>Deletion</strong> {text.deletion.bp}
          <br />
          {text.deletion.where}
        </>
      ) : (
        <>Edge: {text.ends}</>
      ),
    }
  }
  const walkRow = model.hoveredWalkRowText
  if (walkRow) {
    return { testId: 'graph-walk-row-tooltip', body: labelled(walkRow) }
  }
  const tube = model.hoveredTubeText
  return tube
    ? { testId: 'graph-tube-tooltip', body: labelled(tube) }
    : undefined
}

const HoverTooltip = observer(function HoverTooltip({
  model,
  chip,
}: {
  model: GraphPaneModel
  chip: Readout | undefined
}) {
  const tip = hoverTip(model, chip)
  return tip ? (
    <div
      style={{ ...tooltipStyle, right: model.tooltipRightPx }}
      data-testid={tip.testId}
    >
      {tip.body}
    </div>
  ) : null
})

export default HoverTooltip
