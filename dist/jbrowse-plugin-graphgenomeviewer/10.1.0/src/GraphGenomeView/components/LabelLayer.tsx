import { BUBBLE_HALO_COLOR } from '@jbrowse/bandage-core/bubbles/bubbleLabel'
import { bubbleKey, sameBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import { EXON_COLOR } from '@jbrowse/bandage-core/genes/exonOutline'
import { sizeLeader } from '@jbrowse/bandage-core/graphLabels'
import { regionLabel } from '@jbrowse/bandage-core/hoverText'
import { geneCoverageNote, geneLeader } from '@jbrowse/bandage-core/labelLayout'
import { labelWidth } from '@jbrowse/bandage-core/overlayLabels'
import { panSNContig } from '@jbrowse/bandage-core/pansn'
import { passLeader } from '@jbrowse/bandage-core/passLabels'
import { abgrToCssRgba } from '@jbrowse/bandage-core/renderer/colorBits'
import { isAlive } from '@jbrowse/mobx-state-tree'
import { observer } from 'mobx-react'

import LabelChip, { inChip } from './LabelChip'
import { PaneSvgLayer } from './PaneLayer'

import type { GraphPaneModel } from '../model'
import type { BubbleHalo } from '@jbrowse/bandage-core/bubbles/bubbleHalos'
import type { LabelLayout } from '@jbrowse/bandage-core/labelLayout'

// Every chip drawn over the graph, above all of its ink: bubble names, gene
// names on their pins, each lifted walk's passes by name, and the leader from
// a placeholder's length stacked off its loop. `overlayLabels` has placed
// them against each other and against the row labels already.

const GENE_INK = '#1c1c22'
const TICK_PX = 9
const TICK_WIDTH = 3

// What the gene chip under a point reads out, for the hover tooltip: those
// chips leave the pointer to the canvas, so a drag can start on one
export function chipReadoutAt(
  { genes }: Pick<LabelLayout, 'genes'>,
  px: number,
  py: number,
) {
  const named = genes.find(chip => inChip(chip, px, py))?.item
  const note = named && geneCoverageNote(named.pin)
  return named
    ? {
        label: named.name,
        readout: `${regionLabel({ ...named.pin.gene, refName: panSNContig(named.pin.gene.refName) })}${note ? `, ${note} in the cut` : ''}`,
      }
    : undefined
}

const LabelLayer = observer(function LabelLayer({
  model,
}: {
  model: GraphPaneModel
}) {
  const { bubbles, genes, ticks, passes, sizes } = model.overlayLabels
  const leaders = sizes.flatMap(label => {
    const leader = sizeLeader(label)
    return leader ? [{ key: label.key, ...leader }] : []
  })
  if (
    bubbles.length +
      genes.length +
      ticks.length +
      passes.length +
      leaders.length ===
    0
  ) {
    return null
  }
  const {
    scaleX,
    scaleY,
    translateX,
    translateY,
    contigThickness,
    hoveredBubble,
  } = model
  const hoveredTick = hoveredBubble
    ? ticks.find(t => sameBubble(t.item.bubble, hoveredBubble))
    : undefined
  const tickAt = (target: EventTarget) => {
    const index =
      target instanceof Element ? target.getAttribute('data-tick') : null
    return index === null ? undefined : ticks[Number(index)]
  }
  const dimmedBubble = (h: BubbleHalo) => model.bubbleFaded(h)
  const isOpen = (h: BubbleHalo) => model.bubbleIsOpen(h.bubble)

  return (
    <PaneSvgLayer
      model={model}
      zIndex={3}
      testId="graph-label-layer"
      pansWithDrawing
    >
      <g
        data-testid="graph-bubble-ticks"
        onClick={e => {
          const tick = tickAt(e.target)
          if (tick) {
            model.toggleBubble(tick.item.bubble)
          }
        }}
        onMouseOver={e => {
          const tick = tickAt(e.target)
          if (tick) {
            model.setHoveredBubble(tick.item.bubble)
          }
        }}
        // a leave also fires as the view closing it unmounts the tick
        onMouseOut={() => {
          if (isAlive(model)) {
            model.setHoveredBubble(null)
          }
        }}
        onFocus={e => {
          const tick = tickAt(e.target)
          if (tick) {
            model.setHoveredBubble(tick.item.bubble)
          }
        }}
        onBlur={() => {
          if (isAlive(model)) {
            model.setHoveredBubble(null)
          }
        }}
        onKeyDown={e => {
          const tick = tickAt(e.target)
          if (tick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            model.toggleBubble(tick.item.bubble)
          }
        }}
      >
        {ticks.map(({ item: h, x, y }, i) => (
          <rect
            key={bubbleKey(h.bubble)}
            data-tick={i}
            role="button"
            tabIndex={0}
            aria-label={`${h.label}, ${isOpen(h) ? 'close' : 'open'} bubble`}
            x={x - TICK_WIDTH / 2}
            y={y - TICK_PX}
            width={TICK_WIDTH}
            height={TICK_PX}
            rx={TICK_WIDTH / 2}
            fill={BUBBLE_HALO_COLOR}
            opacity={dimmedBubble(h) ? 0.35 : 1}
            style={{ pointerEvents: 'all', cursor: 'pointer' }}
          />
        ))}
      </g>
      {leaders.map(({ key, x1, y1, x2, y2 }) => (
        <line
          key={key}
          data-testid="graph-size-leader"
          x1={x1}
          x2={x2}
          y1={y1}
          y2={y2}
          stroke={GENE_INK}
          strokeWidth={0.8}
          strokeOpacity={0.6}
        />
      ))}
      {genes.map(({ item: { pin, name }, x, y, w, text }) => {
        const { gene } = pin
        const { x1, y1, x2, y2 } = geneLeader(
          { x, y },
          {
            x: pin.at.x * scaleX + translateX,
            y: pin.at.y * scaleY + translateY,
          },
          contigThickness,
        )
        return (
          <g key={`${gene.name}-${gene.refName}-${gene.start}`}>
            <line
              x1={x1}
              x2={x2}
              y1={y1}
              y2={y2}
              stroke={GENE_INK}
              strokeWidth={0.8}
              strokeOpacity={0.6}
            />
            <LabelChip
              x={x}
              y={y}
              w={w}
              text={name}
              note={text.slice(name.length) || undefined}
              color={GENE_INK}
              edge={EXON_COLOR}
              italic
              testId="graph-gene-pin-label"
            />
          </g>
        )
      })}
      {passes.map(({ item, x, y, w, text }) => {
        const ink = abgrToCssRgba(item.ink)
        const { x1, y1, x2, y2 } = passLeader({ x, y }, item.at)
        return (
          <g
            key={`${item.walk}-${item.pass}`}
            data-testid="graph-pass-label"
            style={{ pointerEvents: 'none' }}
          >
            <line
              x1={x1}
              x2={x2}
              y1={y1}
              y2={y2}
              stroke={ink}
              strokeWidth={1}
            />
            <circle cx={item.at.x} cy={item.at.y} r={2} fill={ink} />
            <LabelChip x={x} y={y} w={w} text={text} color={ink} bold />
          </g>
        )
      })}
      {bubbles.map(({ item: h, x, y, w, text }) => (
        <LabelChip
          key={bubbleKey(h.bubble)}
          x={x}
          y={y}
          w={w}
          text={text}
          color={BUBBLE_HALO_COLOR}
          dimmed={dimmedBubble(h)}
          title={`${h.label}\n${h.bubble.segmentCount} segments${h.bubble.covering ? '' : isOpen(h) ? ' · click to close' : ' · click to open'}`}
          testId="graph-bubble-halo-label"
          // the bubble the drawing is would open into this same drawing
          onClick={
            h.bubble.covering
              ? undefined
              : () => {
                  model.toggleBubble(h.bubble)
                }
          }
          // a leave also fires as the view closing it unmounts the chip
          onHover={hovered => {
            if (isAlive(model)) {
              model.setHoveredBubble(hovered ? h.bubble : null)
            }
          }}
        />
      ))}
      {hoveredTick ? (
        <LabelChip
          x={hoveredTick.x}
          y={hoveredTick.y - TICK_PX - 4}
          w={labelWidth(hoveredTick.item.label)}
          text={hoveredTick.item.label}
          color={BUBBLE_HALO_COLOR}
          testId="graph-bubble-tick-label"
        />
      ) : null}
    </PaneSvgLayer>
  )
})

export default LabelLayer
