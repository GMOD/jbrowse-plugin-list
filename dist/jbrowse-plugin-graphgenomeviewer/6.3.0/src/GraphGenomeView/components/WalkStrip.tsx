import { useId, useMemo, useState } from 'react'

import {
  walkRowReadout,
  walkRowsKey,
  walkRowsTree,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
import {
  stripGeneGaps,
  stripRowAt,
  walkMarksTree,
  walkStripLabelsTree,
} from '@jbrowse/bandage-core/layout/walkStrip'
import { RAMP_GRADIENT_CSS } from '@jbrowse/bandage-core/referenceRampCss'
import { isAlive } from '@jbrowse/mobx-state-tree'
import { observer } from 'mobx-react'

import ElTree from './ElTree'
import { WalkRowContextMenu } from './WalkRowContextMenu'
import { Swatch } from './WalkRowsOverlay'
import { legendRowStyle } from './legendStyles'

import type { GraphPaneModel } from '../model'
import type { RowGene } from '@jbrowse/bandage-core/layout/walkRowDraw'
import type { WalkRows } from '@jbrowse/bandage-core/layout/walkRows'
import type { StripFrame } from '@jbrowse/bandage-core/layout/walkStrip'

// Walk rows under a layout that draws nodes, each haplotype's walk on its own
// bp, linked to the drawing above: the hovered node ticks every bar where its
// walk passes it, and a point on a bar lights its node, ringed, above. The
// bars share the drawing's colours, so under the reference-position ramp a hue
// in the drawing is the same hue on each bar. Every row is shown; rows too
// thin to letter say who they are on hover.

const keyStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '2px 14px',
  padding: '2px 8px 6px',
  fontSize: 11,
  color: '#333',
}

const tipStyle = {
  position: 'absolute' as const,
  pointerEvents: 'none' as const,
  background: 'rgba(255,255,255,0.92)',
  border: '1px solid #ccc',
  borderRadius: 3,
  padding: '1px 6px',
  fontSize: 11,
  whiteSpace: 'nowrap' as const,
  zIndex: 4,
}

// The bars, built once per rows, frame, colouring and genes rather than per
// hover
const StripBars = observer(function StripBars({
  bars,
  frame,
  ramp,
  rowGenes,
}: {
  bars: WalkRows
  frame: StripFrame
  ramp: { start: number; end: number } | undefined
  rowGenes: Map<string, RowGene[]> | undefined
}) {
  const idPrefix = useId().replace(/[^\w-]/g, '')
  const tree = useMemo(
    () => walkRowsTree(bars, frame, { ramp, rowGenes, idPrefix }),
    [bars, frame, ramp, rowGenes, idPrefix],
  )
  return <ElTree el={tree} />
})

const WalkStrip = observer(function WalkStrip({
  model,
}: {
  model: GraphPaneModel
}) {
  const bars = model.walkStripRows
  const frame = model.walkStripFrame
  const [menu, setMenu] = useState<
    { row: number; top: number; left: number } | undefined
  >(undefined)
  const [tip, setTip] = useState<
    { text: string; x: number; y: number } | undefined
  >(undefined)
  if (!bars || !frame) {
    return null
  }
  const hit = (e: React.MouseEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - box.left
    const y = e.clientY - box.top
    return { ...stripRowAt(bars, frame, x, y), x, y }
  }
  const key = walkRowsKey(bars, {
    ramp: model.referenceRampDomain,
    rampCss: RAMP_GRADIENT_CSS,
    genes: stripGeneGaps(frame, model.walkRowGenes, model.walkRowGeneGaps),
  })
  return (
    <div
      data-testid="graph-walk-strip"
      style={{ position: 'relative', borderTop: '1px solid #ddd' }}
      onMouseEnter={() => {
        model.setPointerInPane(true)
      }}
      onMouseLeave={() => {
        if (isAlive(model)) {
          model.setPointerInPane(false)
          model.setStripHover(null)
        }
        setTip(undefined)
      }}
    >
      <svg
        width={frame.width}
        height={frame.height}
        style={{ display: 'block', cursor: 'pointer' }}
        onMouseMove={e => {
          const at = hit(e)
          if (at.row) {
            model.setStripHover({ row: at.row.name, offset: at.offset! })
            setTip(
              frame.labelled
                ? undefined
                : {
                    text: `${at.row.label} · ${walkRowReadout(
                      at.row,
                      at.index === 0 ? undefined : bars.reference,
                    )}`,
                    x: at.x,
                    y: at.y,
                  },
            )
          } else {
            model.setStripHover(null)
            setTip(undefined)
          }
        }}
        onClick={e => {
          const at = hit(e)
          if (at.row && at.index! > 0) {
            model.toggleWalk(at.row.name)
          }
        }}
        onContextMenu={e => {
          const at = hit(e)
          if (at.row) {
            e.preventDefault()
            setMenu({ row: at.index!, top: e.clientY, left: e.clientX })
          }
        }}
      >
        <StripBars
          bars={bars}
          frame={frame}
          ramp={model.referenceRampDomain}
          rowGenes={model.walkRowGenes}
        />
        <ElTree el={walkMarksTree(bars, frame, model.walkStripMarks)} />
        <ElTree
          el={walkStripLabelsTree(
            bars,
            frame,
            new Set(model.walkLayers.map(l => l.walk)),
          )}
        />
      </svg>
      {tip ? (
        <div style={{ ...tipStyle, left: tip.x + 12, top: tip.y - 18 }}>
          {tip.text}
        </div>
      ) : null}
      <div style={keyStyle} data-testid="graph-walk-strip-key">
        {key.map(entry => (
          <div key={entry.label} style={legendRowStyle}>
            <Swatch swatch={entry.swatch} />
            <span>{entry.label}</span>
          </div>
        ))}
        <div style={legendRowStyle}>
          <span>
            ▮ ticks: where each walk passes the node under the pointer · click a
            bar to lift its walk
          </span>
        </div>
      </div>
      {menu ? (
        <WalkRowContextMenu
          model={model}
          row={menu.row}
          bars={bars}
          top={menu.top}
          left={menu.left}
          onClose={() => {
            setMenu(undefined)
          }}
        />
      ) : null}
    </div>
  )
})

export default WalkStrip
