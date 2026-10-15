import { useCallback, useMemo } from 'react'

import { computed } from 'mobx'
import { observer } from 'mobx-react'

import ElTree, { useSvgId } from './ElTree'
import { PaneOverlayCanvas, PaneSvgLayer } from './PaneLayer'
import { SECTION_HEADER_PX, walkRowTrees } from '../walkRowGroups'
import { paintWalkRowSpans, walkRowSpans } from '../walkRowSpans'

import type { GraphPaneModel } from '../model'

// The walk-rows layout's bars: one per haplotype walk under the reference
// row, each on its own bp axis from the window's left edge. The runs paint as
// spans on a canvas, coloured by whether they are on the reference walk's
// path, and core's walkRowsTree draws the rest: unit separators, each row's
// genes from its own assembly's annotation, the allele a repeat genotype
// called and a readout. Under the
// reference-position ramp an aligned run takes the hue of the reference it is
// threaded through. In a tandem array that is the aligner's pick among
// near-identical copies, so the hue says which reference copy the graph used,
// not which one a copy resembles.
//
// The walk rows pair a repeat record's allele with each walk — see
// repeats/walkCalls.ts, which also holds the threshold a red readout is read
// off. Colouring each copy by its unit is jbrowse-plugin-tandem-repeat's.

// The spans are recut only when the rows, the zoom or the ramp change
function WalkRowSpansCanvas({ model }: { model: GraphPaneModel }) {
  const spans = useMemo(
    () =>
      computed(() => {
        const bars = model.walkRowBars
        return bars
          ? walkRowSpans(
              [bars.reference, ...bars.rows],
              model.scaleX,
              model.referenceRampDomain,
            )
          : undefined
      }),
    [model],
  )
  const paint = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const bars = model.walkRowBars
      const place = model.walkRowPlacement
      const pitch = model.walkRowPitch
      const painted = spans.get()
      if (!bars || !place || !pitch || !painted) {
        return
      }
      const sections = model.walkRowGroups?.sections
      const blocks = sections?.length
        ? [
            { first: 0, count: 1, rowY: place.rowY(0) },
            ...sections.map(s => ({
              first: s.first,
              count: s.count,
              rowY: place.rowY(s.first),
            })),
          ]
        : [{ first: 0, count: bars.rows.length + 1, rowY: place.rowY(0) }]
      paintWalkRowSpans(ctx, painted, {
        ...model.screenTransform,
        width: model.paneWidth,
        height: model.canvasHeight,
        rowPx: pitch.rowPx,
        barPx: pitch.barPx,
        origin: bars.origin,
        blocks,
      })
    },
    [model, spans],
  )
  return (
    <PaneOverlayCanvas
      model={model}
      zIndex={3}
      testId="graph-walk-rows-spans"
      paint={paint}
    />
  )
}

// Its own observer, so moving between rows redraws this rect and not every row
const HoveredWalkRow = observer(function HoveredWalkRow({
  model,
}: {
  model: GraphPaneModel
}) {
  const bars = model.walkRowBars
  const place = model.walkRowPlacement
  const pitch = model.walkRowPitch
  if (!bars || !place || !pitch || !model.hoveredWalkRowText) {
    return null
  }
  const rows = [bars.reference, ...bars.rows]
  const index = rows.findIndex(r => r.name === model.hoveredWalkRow)
  const row = rows[index]
  if (!row) {
    return null
  }
  const start = model.toScreen({ x: bars.origin, y: place.rowY(index) })
  return (
    <rect
      data-testid="graph-walk-row-hovered"
      x={start.x - 2}
      y={start.y - pitch.rowPx / 2 - 1}
      width={row.bp * model.scaleX + 4}
      height={pitch.rowPx + 2}
      fill="none"
      stroke="#111"
      strokeWidth={1}
    />
  )
})

// `vector` for an SVG export, which draws the bars as walkRowsTree's rects
const WalkRowsOverlay = observer(function WalkRowsOverlay({
  model,
  vector = false,
}: {
  model: GraphPaneModel
  vector?: boolean
}) {
  const idPrefix = useSvgId()
  const bars = model.walkRowBars
  const place = model.walkRowPlacement
  const pitch = model.walkRowPitch
  const bare = useMemo(
    () =>
      bars && {
        ...bars,
        reference: { ...bars.reference, runs: [] },
        rows: bars.rows.map(r => ({ ...r, runs: [] })),
      },
    [bars],
  )
  if (!bars || !bare || !place || !pitch) {
    return null
  }
  const { paneWidth: width, canvasHeight } = model
  const frame = {
    ...model.screenTransform,
    width,
    height: canvasHeight,
    ...pitch,
  }
  return (
    <>
      {vector ? null : <WalkRowSpansCanvas model={model} />}
      <PaneSvgLayer
        model={model}
        zIndex={3}
        overflow="visible"
        testId="graph-walk-rows"
      >
        {walkRowTrees(
          vector ? bars : bare,
          model.walkRowGroups?.sections ?? [],
          place.rowY,
          frame,
          {
            ramp: model.referenceRampDomain,
            rowGenes: model.walkRowGenes,
            idPrefix,
          },
        ).map((tree, i) => (
          <ElTree key={i} el={tree} />
        ))}
        {place.headers.map(header => (
          <text
            key={header.key}
            x={10}
            y={
              model.toScreen({ x: 0, y: header.top }).y + SECTION_HEADER_PX - 4
            }
            fontFamily="sans-serif"
            fontSize={11}
            fontWeight="bold"
            fill="#333"
            data-testid="graph-walk-section"
          >
            {header.title}
          </text>
        ))}
        <HoveredWalkRow model={model} />
      </PaneSvgLayer>
    </>
  )
})

export default WalkRowsOverlay
