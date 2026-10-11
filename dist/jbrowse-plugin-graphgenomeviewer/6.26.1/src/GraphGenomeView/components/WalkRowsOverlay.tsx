import { useEffect, useId, useMemo, useRef } from 'react'

import { walkRowsTree } from '@jbrowse/bandage-core/layout/walkRowDraw'
import { observer } from 'mobx-react'

import ElTree from './ElTree'
import { SECTION_HEADER_PX } from '../walkRowGroups'
import { paintWalkRowSpans, walkRowSpans } from '../walkRowSpans'

import type { GraphPaneModel } from '../model'
import type { WalkRowSection } from '../walkRowGroups'
import type { El } from '@jbrowse/bandage-core/el'
import type {
  WalkRowsFrame,
  WalkRowsWithCalls,
} from '@jbrowse/bandage-core/layout/walkRowDraw'

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

const svgStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  overflow: 'visible' as const,
  zIndex: 3,
}

// The rows' trees, a section at a time while grouped. walkRowsTree puts its
// i-th row at i * rowPx below its reference row and draws that row too, so
// each section is drawn shifted down to its place with its reference row
// dropped.
export function walkRowTrees(
  bars: WalkRowsWithCalls,
  sections: WalkRowSection[],
  rowY: (i: number) => number,
  frame: WalkRowsFrame & { rowPx: number },
  o: Parameters<typeof walkRowsTree>[2] & { idPrefix: string },
): El[] {
  if (sections.length === 0) {
    return [walkRowsTree(bars, frame, o)]
  }
  return [
    walkRowsTree({ ...bars, rows: [] }, frame, o),
    ...sections.flatMap((section, k) => {
      const tree = walkRowsTree(
        {
          ...bars,
          rows: bars.rows.slice(
            section.first - 1,
            section.first - 1 + section.count,
          ),
        },
        {
          ...frame,
          translateY:
            frame.translateY +
            (rowY(section.first) - frame.rowPx) * frame.scaleY,
        },
        { ...o, idPrefix: `${o.idPrefix}-s${k}` },
      )
      return tree.children.filter(
        (c): c is El =>
          typeof c !== 'string' &&
          c.attrs['data-testid'] !== 'graph-walk-reference',
      )
    }),
  ]
}

const canvasStyle = { ...svgStyle, overflow: undefined }

const WalkRowSpansCanvas = observer(function WalkRowSpansCanvas({
  model,
  rows,
  origin,
}: {
  model: GraphPaneModel
  rows: WalkRowsWithCalls['rows']
  origin: number
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { scaleX, scaleY, translateX, translateY, paneWidth, canvasHeight } =
    model
  const place = model.walkRowPlacement
  const pitch = model.walkRowPitch
  const sections = model.walkRowGroups?.sections
  const ramp = model.referenceRampDomain
  const spans = useMemo(
    () => walkRowSpans(rows, scaleX, ramp),
    [rows, scaleX, ramp],
  )
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !place || !pitch) {
      return
    }
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, paneWidth, canvasHeight)
    const blocks = sections?.length
      ? [
          { first: 0, count: 1, rowY: place.rowY(0) },
          ...sections.map(s => ({
            first: s.first,
            count: s.count,
            rowY: place.rowY(s.first),
          })),
        ]
      : [{ first: 0, count: rows.length, rowY: place.rowY(0) }]
    paintWalkRowSpans(ctx, spans, {
      scaleX,
      scaleY,
      translateX,
      translateY,
      width: paneWidth,
      height: canvasHeight,
      rowPx: pitch.rowPx,
      barPx: pitch.barPx,
      origin,
      blocks,
    })
  }, [
    spans,
    rows.length,
    origin,
    place,
    pitch,
    sections,
    scaleX,
    scaleY,
    translateX,
    translateY,
    paneWidth,
    canvasHeight,
  ])
  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
  return (
    <canvas
      ref={ref}
      data-testid="graph-walk-rows-spans"
      width={Math.round(paneWidth * dpr)}
      height={Math.round(canvasHeight * dpr)}
      style={{ ...canvasStyle, width: paneWidth, height: canvasHeight }}
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
  const idPrefix = useId().replace(/[^\w-]/g, '')
  const bars = model.walkRowBars
  const place = model.walkRowPlacement
  const pitch = model.walkRowPitch
  const drawn = useMemo(
    () =>
      bars && {
        all: [bars.reference, ...bars.rows],
        bare: {
          ...bars,
          reference: { ...bars.reference, runs: [] },
          rows: bars.rows.map(r => ({ ...r, runs: [] })),
        },
      },
    [bars],
  )
  if (!bars || !drawn || !place || !pitch) {
    return null
  }
  const { paneWidth: width, canvasHeight } = model
  const Y = (y: number) => y * model.scaleY + model.translateY
  const hovered = model.hoveredWalkRowText
    ? [bars.reference, ...bars.rows].findIndex(
        r => r.name === model.hoveredWalkRow,
      )
    : -1
  const row =
    hovered >= 0 ? [bars.reference, ...bars.rows][hovered]! : undefined
  const frame = {
    scaleX: model.scaleX,
    scaleY: model.scaleY,
    translateX: model.translateX,
    translateY: model.translateY,
    width,
    height: canvasHeight,
    ...pitch,
  }
  return (
    <>
      {vector ? null : (
        <WalkRowSpansCanvas
          model={model}
          rows={drawn.all}
          origin={bars.origin}
        />
      )}
      <svg
        style={svgStyle}
        width={width}
        height={canvasHeight}
        data-testid="graph-walk-rows"
      >
        {walkRowTrees(
          vector ? bars : drawn.bare,
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
            y={Y(header.top) + SECTION_HEADER_PX - 4}
            fontFamily="sans-serif"
            fontSize={11}
            fontWeight="bold"
            fill="#333"
            data-testid="graph-walk-section"
          >
            {header.title}
          </text>
        ))}
        {row ? (
          <rect
            data-testid="graph-walk-row-hovered"
            x={bars.origin * model.scaleX + model.translateX - 2}
            y={Y(place.rowY(hovered)) - pitch.rowPx / 2 - 1}
            width={row.bp * model.scaleX + 4}
            height={pitch.rowPx + 2}
            fill="none"
            stroke="#111"
            strokeWidth={1}
          />
        ) : null}
      </svg>
    </>
  )
})

export default WalkRowsOverlay
