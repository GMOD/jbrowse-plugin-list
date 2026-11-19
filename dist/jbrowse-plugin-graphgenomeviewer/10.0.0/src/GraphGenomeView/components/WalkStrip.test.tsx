import { liftedRowInks } from '@jbrowse/bandage-core/layout/rowInks'
import { walkRows } from '@jbrowse/bandage-core/layout/walkRows'
import { walkStripFrame } from '@jbrowse/bandage-core/layout/walkStrip'
import { loadGraph } from '@jbrowse/bandage-core/pipeline'
import { walkLift } from '@jbrowse/bandage-core/walkHighlight'
import { act, render, screen } from '@testing-library/react'
import { observable, runInAction } from 'mobx'

import WalkStrip, { StripTip } from './WalkStrip'

import type { GraphPaneModel } from '../model'

const row = (name: string, bp: number) => ({
  name,
  label: name,
  bp,
  gapBp: 0,
  complete: true,
  runs: [],
})

test("the strip tip reads the hovered row from the model's strip hover", () => {
  const model = observable({
    walkStripRows: {
      origin: 0,
      reference: row('GRCh38', 1000),
      rows: [row('HG00097#1', 1500)],
    },
    walkStripFrame: {
      labelled: false,
      width: 1000,
      scaleX: 0.5,
      translateX: 0,
      rowPx: 10,
      translateY: 5,
    },
    stripHover: null as { row: string; offset: number } | null,
  })
  render(<StripTip model={model as unknown as GraphPaneModel} />)
  expect(screen.queryByTestId('graph-walk-strip-tip')).toBeNull()
  act(() => {
    runInAction(() => {
      model.stripHover = { row: 'HG00097#1', offset: 200 }
    })
  })
  const tip = screen.getByTestId('graph-walk-strip-tip')
  expect(tip.textContent).toMatch(/^HG00097#1 · /)
  expect(tip.style.left).toBe('112px')
  expect(tip.style.top).toBe('-3px')

  // past the middle of the strip the tip opens leftward
  act(() => {
    runInAction(() => {
      model.stripHover = { row: 'HG00097#1', offset: 1400 }
    })
  })
  const flipped = screen.getByTestId('graph-walk-strip-tip')
  expect(flipped.style.left).toBe('')
  expect(flipped.style.right).toBe('312px')
})

test("the strip paints a lifted walk's row in its colours and keys the grey strip over it", () => {
  const graph = loadGraph(
    [
      'S\t1\tACGT',
      'S\t2\tGGCCGGCC',
      'S\t3\tTTTT',
      'W\tGRCh38\t0\tchr1\t0\t8\t>1>3',
      'W\tB\t1\tctg\t0\t16\t>1>2>3',
      'W\tA\t1\tctg\t0\t8\t>1>3',
    ].join('\n'),
    'walks',
  )
  const bars = walkRows(graph)!
  const lift = walkLift(graph, [
    { walk: 'GRCh38#0#chr1' },
    { walk: 'B#1#ctg', color: { field: 'progress' } },
  ])!
  const model = {
    walkStripRows: bars,
    walkStripFrame: walkStripFrame(bars, { width: 600 }),
    walkStripInks: liftedRowInks(lift.walks),
    walkStripMarks: [],
    walkLayers: lift.walks.map(w => ({ walk: w.name })),
    referenceRampDomain: { start: 0, end: 8 },
  }
  const { container } = render(
    <WalkStrip model={model as unknown as GraphPaneModel} />,
  )
  const gradient = container.querySelector(
    'linearGradient[gradientUnits="userSpaceOnUse"]',
  )!
  const [first] = model.walkStripInks.find(i => i.walk === 'B#1#ctg')!.stops
  expect(gradient.querySelector('stop')!.getAttribute('stop-color')).toBe(first)
  expect(
    container.querySelectorAll('[data-testid="graph-walk-on-path"]').length,
  ).toBeGreaterThan(0)
  expect(screen.getByTestId('graph-walk-strip-key').textContent).toContain(
    "grey above: on GRCh38#0's path",
  )
})
