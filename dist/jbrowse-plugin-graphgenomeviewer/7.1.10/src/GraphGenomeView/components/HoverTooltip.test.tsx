import { render, screen } from '@testing-library/react'

import HoverTooltip from './HoverTooltip'

import type { GraphPaneModel } from '../model'

function shown(state: Record<string, unknown>) {
  const model = {
    hoveredNode: null,
    hoveredEdge: null,
    hoveredWalkRowText: undefined,
    hoveredTubeText: undefined,
    tooltipRightPx: 8,
    deletions: [],
    ...state,
  } as unknown as GraphPaneModel
  render(<HoverTooltip model={model} chip={undefined} />)
  return screen.queryAllByText(/—/).map(el => el.textContent)
}

test('a point on both a tube and a walk row reads out one of them', () => {
  expect(
    shown({
      hoveredTubeText: { label: 'HG002#1', readout: 'node 12' },
      hoveredWalkRowText: { label: 'HG002#2', readout: '3 copies' },
    }),
  ).toEqual(['HG002#2 — 3 copies'])
})

test('a node outranks the walk row under it', () => {
  const node = { id: '7', name: 's7', length: 1200, depth: 2 }
  expect(
    shown({
      hoveredNode: '7',
      hoverNodeById: new Map([['7', node]]),
      hoveredWalkRowText: { label: 'HG002#2', readout: '3 copies' },
    }),
  ).toEqual(['s7 — 1,200 bp, depth 2.0'])
})
