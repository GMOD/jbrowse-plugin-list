import { useCallback, useMemo } from 'react'

import { barEnd } from '@jbrowse/bandage-core/layout/walkRowDraw'
import { computed, untracked } from 'mobx'
import { observer } from 'mobx-react'

import ElTree, { useSvgId } from './ElTree'
import {
  PaneOverlayCanvas,
  PaneSvgLayer,
  PaneTranslateGroup,
} from './PaneLayer'
import { dependOn } from '../pane/paneBase'
import { paintWalkRowBlocks } from '../walkRowBlocks'
import {
  SECTION_HEADER_PX,
  walkRowTrees,
  walkRowTreesPanKey,
} from '../walkRowGroups'
import { paintWalkRowSpans, walkRowSpans } from '../walkRowSpans'

import type { GraphPaneModel } from '../model'
import type { RowPitch } from '@jbrowse/bandage-core/layout/walkRowDraw'

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
const WalkRowSpansCanvas = observer(function WalkRowSpansCanvas({
  model,
}: {
  model: GraphPaneModel
}) {
  const spans = useMemo(
    () =>
      computed(() =>
        model.walkRowBars
          ? walkRowSpans(
              model.walkRowList,
              model.scaleX,
              model.referenceRampDomain,
            )
          : undefined,
      ),
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
      paintWalkRowSpans(ctx, painted, {
        ...model.screenTransform,
        width: model.paneWidth,
        height: model.canvasHeight,
        rowPx: pitch.rowPx,
        barPx: pitch.barPx,
        origin: bars.origin,
        blocks: place.blocks(bars.rows.length + 1),
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
})

const RIBBON_FORWARD = 'rgba(160, 196, 232, 0.55)'
const RIBBON_REVERSED = 'rgba(160, 140, 220, 0.55)'

// Under the bars, a ribbon from each stretch of a row to where the row below
// walks the same nodes, lavender where it walks them backwards, as ggbandage
// draws them: neighbours that share a copy, an inversion or a duplication
// read off the ribbons' shape
const WalkRowRibbonsCanvas = observer(function WalkRowRibbonsCanvas({
  model,
}: {
  model: GraphPaneModel
}) {
  const paint = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const links = model.walkRowRibbons
      const bars = model.walkRowBars
      const place = model.walkRowPlacement
      const pitch = model.walkRowPitch
      if (!links || !bars || !place || !pitch) {
        return
      }
      const { scaleX, scaleY, translateX, translateY } = model.screenTransform
      const x = (offset: number) => (bars.origin + offset) * scaleX + translateX
      const half = pitch.barPx / 2
      for (const { row, a0, a1, b0, b1 } of links) {
        const top = place.rowY(row) * scaleY + translateY + half
        const bottom = place.rowY(row + 1) * scaleY + translateY - half
        ctx.fillStyle = b0 > b1 ? RIBBON_REVERSED : RIBBON_FORWARD
        ctx.beginPath()
        ctx.moveTo(x(a0), top)
        ctx.lineTo(x(a1), top)
        ctx.lineTo(x(b1), bottom)
        ctx.lineTo(x(b0), bottom)
        ctx.closePath()
        ctx.fill()
      }
    },
    [model],
  )
  return (
    <PaneOverlayCanvas
      model={model}
      zIndex={2}
      testId="graph-walk-rows-ribbons"
      paint={paint}
    />
  )
})

// Over the bars, the lettered blocks: copy A on two rows, and C where another
// row has A, read at a glance
const WalkRowBlocksCanvas = observer(function WalkRowBlocksCanvas({
  model,
}: {
  model: GraphPaneModel
}) {
  const paint = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const blocks = model.sharedBlocks
      const bars = model.walkRowBars
      const place = model.walkRowPlacement
      const pitch = model.walkRowPitch
      if (!blocks || !bars || !place || !pitch) {
        return
      }
      const { scaleX, scaleY, translateX, translateY } = model.screenTransform
      paintWalkRowBlocks(ctx, blocks, {
        x: offset => (bars.origin + offset) * scaleX + translateX,
        rowCentre: row => place.rowY(row) * scaleY + translateY,
        barPx: pitch.barPx,
      })
    },
    [model],
  )
  return (
    <PaneOverlayCanvas
      model={model}
      zIndex={3}
      testId="graph-walk-rows-blocks"
      paint={paint}
    />
  )
})

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
  const rows = model.walkRowList
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
      width={barEnd(row) * model.scaleX + 4}
      height={pitch.rowPx + 2}
      fill="none"
      stroke="#111"
      strokeWidth={1}
    />
  )
})

type WalkRowTreesSource = Pick<
  GraphPaneModel,
  | 'walkRowBars'
  | 'walkRowPlacement'
  | 'walkRowPitch'
  | 'walkRowGroups'
  | 'referenceRampDomain'
  | 'walkRowGenes'
  | 'scaleX'
  | 'scaleY'
  | 'translateX'
  | 'translateY'
  | 'paneWidth'
  | 'canvasHeight'
>

// The rows' trees and the translate they were drawn at. A zoom redraws them,
// and a pan only when it culls another row or turns a readout round.
export function walkRowTreesOnPane(
  model: WalkRowTreesSource,
  idPrefix: string,
  vector: boolean,
) {
  const translate = () => ({
    translateX: model.translateX,
    translateY: model.translateY,
  })
  const frameAt = (
    pitch: RowPitch,
    at: { translateX: number; translateY: number },
  ) => ({
    scaleX: model.scaleX,
    scaleY: model.scaleY,
    translateX: at.translateX,
    translateY: at.translateY,
    width: model.paneWidth,
    height: model.canvasHeight,
    ...pitch,
    bars: vector,
  })
  const panKey = computed(() => {
    const bars = model.walkRowBars
    const place = model.walkRowPlacement
    const pitch = model.walkRowPitch
    return bars && place && pitch
      ? walkRowTreesPanKey(bars, place.rowY, frameAt(pitch, translate()))
      : undefined
  })
  return computed(() => {
    const bars = model.walkRowBars
    const place = model.walkRowPlacement
    const pitch = model.walkRowPitch
    dependOn(panKey.get())
    const at = untracked(translate)
    return bars && place && pitch
      ? {
          at,
          trees: walkRowTrees(
            bars,
            model.walkRowGroups?.sections ?? [],
            place.rowY,
            frameAt(pitch, at),
            {
              ramp: model.referenceRampDomain,
              rowGenes: model.walkRowGenes,
              idPrefix,
            },
          ),
        }
      : undefined
  })
}

const WalkSectionHeaders = observer(function WalkSectionHeaders({
  model,
}: {
  model: GraphPaneModel
}) {
  return model.walkRowPlacement?.headers.map(header => (
    <text
      key={header.key}
      x={10}
      y={model.toScreen({ x: 0, y: header.top }).y + SECTION_HEADER_PX - 4}
      fontFamily="sans-serif"
      fontSize={11}
      fontWeight="bold"
      fill="#333"
      data-testid="graph-walk-section"
    >
      {header.title}
    </text>
  ))
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
  const drawn = useMemo(
    () => walkRowTreesOnPane(model, idPrefix, vector),
    [model, idPrefix, vector],
  ).get()
  return drawn ? (
    <>
      {vector || !model.walkRowRibbons ? null : (
        <WalkRowRibbonsCanvas model={model} />
      )}
      {vector ? null : <WalkRowSpansCanvas model={model} />}
      {vector || !model.sharedBlocks ? null : (
        <WalkRowBlocksCanvas model={model} />
      )}
      <PaneSvgLayer
        model={model}
        zIndex={3}
        overflow="visible"
        testId="graph-walk-rows"
      >
        <PaneTranslateGroup model={model} drawnAt={drawn.at}>
          {drawn.trees.map((tree, i) => (
            <ElTree key={i} el={tree} />
          ))}
        </PaneTranslateGroup>
        <WalkSectionHeaders model={model} />
        <HoveredWalkRow model={model} />
      </PaneSvgLayer>
    </>
  ) : null
})

export default WalkRowsOverlay
