import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { againstHoverText } from '@jbrowse/bandage-core/againstReference'
import { isBackbone } from '@jbrowse/bandage-core/anchoredNodes'
import { genesOverNode } from '@jbrowse/bandage-core/genes/geneNames'
import {
  edgeHoverText,
  nodeEndLabel,
  nodeHoverName,
  placeholderHoverText,
  regionLabel,
  replacedStretchText,
  skipAt,
} from '@jbrowse/bandage-core/hoverText'
import { referenceLabel } from '@jbrowse/bandage-core/reference'
import {
  eventsAtLink,
  eventsAtNode,
  threadsThrough,
} from '@jbrowse/bandage-core/threadFold'
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

// the most threads a folded node's hover lists, the widest first
const HOVER_THREADS = 6

// What a fold to threads kept there, in graph-fold's words, which the graph
// itself never writes (bandage-core graphLabels.ts)
function eventLines(events: readonly { text: string }[]) {
  return events.map(event => (
    <span key={event.text}>
      <br />
      {event.text}
    </span>
  ))
}

// A folded node's hover: the nodes it holds, the events it is drawn for and
// the threads through it, each with its count and what its haplotypes differ
// by under the fold. A fold of runs names only the reference nodes it holds.
function foldedNodeLines(
  model: GraphPaneModel,
  nodeId: string,
  held: number | undefined,
) {
  const nodes = model.cutWalks ? 'reference nodes' : 'nodes'
  const graph = model.graph
  const threads = graph?.threadFold
    ? threadsThrough(graph, nodeId, name => model.walkLabel(name)).sort(
        (a, b) => b.count - a.count,
      )
    : []
  return graph?.threadFold ? (
    <>
      {held && held > 1 ? (
        <>
          <br />
          {held.toLocaleString()} {nodes} folded into it
        </>
      ) : null}
      {eventLines(eventsAtNode(model.threadEvents ?? [], nodeId))}
      {threads.slice(0, HOVER_THREADS).map(thread => (
        <span key={thread.name}>
          <br />
          {thread.line}
        </span>
      ))}
      {threads.length > HOVER_THREADS ? (
        <>
          <br />
          and {threads.length - HOVER_THREADS} more threads
        </>
      ) : null}
    </>
  ) : null
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
    const placeholder = placeholderHoverText(node)
    const name = nodeHoverName(model.graph, node)
    const merged = model.hoverDrawing?.members.get(node.id)
    const own = nodeOwnLocation(node)
    const region = model.graphRegion
    const span = model.hoveredSpan
    const graph = model.drawnGraph
    const onReference =
      region && span && !isBackbone(node)
        ? replacedStretchText(
            (graph && referenceLabel(graph, region)) ??
              `${region.assemblyName} ${region.refName}`,
            span,
          )
        : undefined
    const against =
      graph &&
      againstHoverText(
        graph,
        node.id,
        referenceLabel(graph, region) ?? undefined,
      )
    const genes = genesOverNode(model.genePins, node.id)
    const genesLine =
      genes.length > 0 ? (
        <>
          <br />
          <em>{genes.join(', ')}</em>
        </>
      ) : null
    return placeholder
      ? {
          body: (
            <>
              {placeholder}
              {genesLine}
            </>
          ),
        }
      : {
          body: (
            <>
              {name === undefined ? (
                <strong>{node.length.toLocaleString()} bp</strong>
              ) : (
                <>
                  <strong>{name}</strong>
                  {merged ? ` and ${merged.length - 1} more` : ''} —{' '}
                  {node.length.toLocaleString()} bp
                </>
              )}
              , depth {node.depth.toFixed(1)}
              {/* the assembly that contributed the segment, and where on it */}
              {own ? (
                <>
                  <br />
                  {own.sample} {regionLabel(own)} (rank {node.stable?.rank})
                </>
              ) : null}
              {onReference ? (
                <>
                  <br />
                  {onReference}
                </>
              ) : null}
              {against ? (
                <>
                  <br />
                  {against}
                </>
              ) : null}
              {genesLine}
              {foldedNodeLines(
                model,
                node.id,
                node.members?.filter(name => !model.notLoadedNames.has(name))
                  .length,
              )}
              {/* gfa-to-tabix --max-component left its component off the
              reference, so the cut holds only its ends */}
              {node.moved ? (
                <>
                  <br />
                  End of a component too large to draw here
                </>
              ) : null}
            </>
          ),
        }
  }
  const graph = model.graph
  const hovered = model.hoveredEdge
  const edge = hovered === null ? undefined : graph?.edges[hovered]
  if (graph && hovered !== null && edge) {
    const text = edgeHoverText(
      edge,
      skipAt(graph, hovered, model.deletions, model.deletionRoutes),
      id => model.nodeById?.get(id)?.name ?? id,
      (id, strand) => {
        const end = model.nodeById?.get(id)
        return end ? nodeEndLabel(graph, end, strand) : `${id}${strand}`
      },
    )
    // a link that skips reference sequence says how much, naming the
    // reference as the key does, and no event
    const reference = referenceLabel(graph)
    return {
      body: text.deletion ? (
        <>
          {`skips ${text.deletion.bp ? `${text.deletion.bp} of ` : ''}${reference ?? 'the reference'} sequence`}
          {text.deletion.where ? (
            <>
              <br />
              {text.deletion.where}
            </>
          ) : null}
        </>
      ) : (
        <>
          Edge: {text.ends}
          {eventLines(eventsAtLink(model.threadEvents ?? [], edge))}
        </>
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
  const ref = useRef<HTMLDivElement>(null)
  const [left, setLeft] = useState(false)
  const right = model.tooltipRightPx
  const node = model.hoveredNodeScreenBox
  // Measured before paint, as it would stand in the corner: where it would
  // cover the node it tells of, it stands in the other corner
  useLayoutEffect(() => {
    const el = ref.current
    const x1 = model.paneWidth - right
    setLeft(
      !!el &&
        !!node &&
        node.x1 >= x1 - el.offsetWidth &&
        node.x0 <= x1 &&
        node.y1 >= el.offsetTop,
    )
  }, [model.paneWidth, right, node])
  return tip ? (
    <div
      ref={ref}
      style={{
        ...tooltipStyle,
        ...(left ? { left: TOOLTIP_INSET_PX } : { right }),
      }}
      data-testid={tip.testId}
    >
      {tip.body}
    </div>
  ) : null
})

export default HoverTooltip
