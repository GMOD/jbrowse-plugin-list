import { serializeEl } from '@jbrowse/bandage-core/el'
import { rowPitch } from '@jbrowse/bandage-core/layout/walkRowDraw'
import { render, screen } from '@testing-library/react'
import { autorun, observable, runInAction } from 'mobx'

import {
  WalkRowTrees,
  WalkRowsScaleBar,
  walkRowTreesOnPane,
} from './WalkRowsOverlay'
import { sectionPlacement } from '../walkRowGroups'

import type { WalkRow } from '@jbrowse/bandage-core/layout/walkRows'

function row(name: string, bp: number): WalkRow {
  return {
    name,
    label: name,
    sample: name,
    bp,
    offReferenceBp: 0,
    gapBp: 0,
    complete: true,
    runs: [{ start: 0, bp, onReference: true, referenceStart: 1000 }],
  }
}

function pane() {
  const pitch = rowPitch(4, 200)
  const source = observable({
    walkRowBars: {
      origin: 1000,
      reference: row('GRCh38', 3000),
      rows: [row('A', 2000), row('B', 2500), row('C', 1000)],
    },
    walkRowPlacement: sectionPlacement([], pitch.rowPx),
    walkRowPitch: pitch,
    walkRowGroups: undefined,
    referenceRampDomain: undefined,
    walkRowGenes: undefined,
    scaleX: 0.1,
    scaleY: 1,
    translateX: 20,
    translateY: 10,
    drawingWidth: 600,
    canvasHeight: 200,
    rowVisitsNeeded: false,
  })
  const trees = walkRowTreesOnPane(source, 't', false)
  const seen: unknown[] = []
  const stop = autorun(() => {
    seen.push(trees.get())
  })
  return { source, seen, stop }
}

test('a pan reuses the trees and the translate they were drawn at', () => {
  const { source, seen, stop } = pane()
  runInAction(() => {
    source.translateX = 35
    source.translateY = 4
  })
  expect(seen).toHaveLength(1)
  expect(seen[0]).toMatchObject({ at: { translateX: 20, translateY: 10 } })
  stop()
})

test('a zoom redraws the trees, and so does a pan that turns a readout round', () => {
  const { source, seen, stop } = pane()
  runInAction(() => {
    source.scaleX = 0.2
  })
  expect(seen).toHaveLength(2)
  runInAction(() => {
    source.translateX = 380
  })
  expect(seen).toHaveLength(3)
  expect(seen[2]).toMatchObject({ at: { translateX: 380, translateY: 10 } })
  stop()
})

// A row whose walk starts 1 kb into the window, and the rows' scale bar
function placedPane() {
  const late: WalkRow = {
    ...row('LATE', 2000),
    runs: [{ start: 1000, bp: 2000, onReference: true, referenceStart: 2000 }],
  }
  const pitch = rowPitch(2, 200)
  return {
    walkRowBars: { origin: 1000, reference: row('GRCh38', 3000), rows: [late] },
    walkRowPlacement: sectionPlacement([], pitch.rowPx),
    walkRowPitch: pitch,
    walkRowList: [row('GRCh38', 3000), late],
    hoveredWalkRow: 'LATE',
    hoveredWalkRowText: { label: 'LATE', readout: '≥ 2.0 kb' },
    scaleX: 0.1,
    canvasHeight: 200,
    toScreen: ({ x, y }: { x: number; y: number }) => ({
      x: x * 0.1 - 100,
      y: y + 10,
    }),
  }
}

test("a scale bar under the rows gives a round length at the rows' scale, not the ruler's", () => {
  const model = placedPane()
  render(
    <svg>
      <WalkRowsScaleBar model={model} />
    </svg>,
  )
  const bar = screen.getByTestId('graph-walk-scale-bar')
  expect(bar.textContent).toBe('1.0 kb')
  const [line] = bar.getElementsByTagName('line')
  const x1 = Number(line!.getAttribute('x1'))
  const x2 = Number(line!.getAttribute('x2'))
  expect(x1).toBe(0)
  expect(x2 - x1).toBeCloseTo(1000 * model.scaleX)
  expect(Number(line!.getAttribute('y1'))).toBeGreaterThan(
    model.toScreen({ x: 0, y: model.walkRowPlacement.rowY(1) }).y,
  )
})

// JBrowse's page sets letter spacing that SVG text inherits and a canvas
// measure does not, so H-SMN drew HG00133#1's readout 20 px wider than
// measured, under the key
test('the readouts are drawn with no letter spacing of the page', () => {
  const { source, stop } = pane()
  const drawn = walkRowTreesOnPane(source, 't', false).get()!
  stop()
  const { container } = render(
    <svg style={{ letterSpacing: '0.1em' }}>
      <WalkRowTrees trees={drawn.trees} />
    </svg>,
  )
  const texts = [...container.querySelectorAll('text')]
  expect(texts.length).toBeGreaterThan(0)
  for (const text of texts) {
    expect(text.closest('[letter-spacing="0"]')).not.toBeNull()
  }
})

// The plugin paints bars on a canvas and from bandage-core's dd9eed7 drew no
// chevron, while its key and readouts said "reversed"
test('the trees drawn over the canvas bars carry the chevrons of a stretch walked against the reference', () => {
  const pitch = rowPitch(2, 200)
  const reversed: WalkRow = {
    ...row('R', 2000),
    runs: [
      {
        start: 0,
        bp: 2000,
        onReference: true,
        referenceStart: 1000,
        reversed: true,
      },
    ],
  }
  const forward = row('F', 2000)
  const svgOf = (rows: WalkRow[]) =>
    walkRowTreesOnPane(
      {
        walkRowBars: { origin: 1000, reference: row('GRCh38', 3000), rows },
        walkRowPlacement: sectionPlacement([], pitch.rowPx),
        walkRowPitch: pitch,
        walkRowGroups: undefined,
        referenceRampDomain: undefined,
        walkRowGenes: undefined,
        scaleX: 0.1,
        scaleY: 1,
        translateX: 20,
        translateY: 10,
        drawingWidth: 600,
        canvasHeight: 200,
        rowVisitsNeeded: false,
      },
      't',
      false,
    )
      .get()!
      .trees.map(serializeEl)
      .join('')
  const svg = svgOf([reversed])
  expect(svg.match(/<polyline /g)?.length ?? 0).toBeGreaterThan(0)
  expect(svgOf([forward])).not.toContain('<polyline ')
})
