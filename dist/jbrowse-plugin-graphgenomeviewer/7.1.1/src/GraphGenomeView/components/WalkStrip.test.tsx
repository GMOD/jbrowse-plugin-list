import { act, render, screen } from '@testing-library/react'
import { observable, runInAction } from 'mobx'

import { StripTip } from './WalkStrip'

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
})
