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

const region = {
  assemblyName: 'GRCh38',
  refName: 'chr6',
  start: 0,
  end: 10_000,
}

test('a node off the reference also says where it sits on the reference', () => {
  const node = {
    id: '7',
    name: 's7',
    length: 1200,
    depth: 1,
    stable: { refName: 'HG002#1#h1tg01', start: 500, rank: 1 },
  }
  expect(
    shown({
      hoveredNode: '7',
      hoverNodeById: new Map([['7', node]]),
      graphRegion: region,
      hoveredSpan: { start: 1000, end: 2000 },
    }),
  ).toEqual([
    's7 — 1,200 bp, depth 1.0HG002 h1tg01:501-1,700 (rank 1)Reference GRCh38 chr6:1,001-2,000',
  ])
})

test('a backbone node reads its own location only', () => {
  const node = {
    id: '7',
    name: 's7',
    length: 1000,
    depth: 1,
    stable: { refName: 'GRCh38#0#chr6', start: 1000, rank: 0 },
  }
  expect(
    shown({
      hoveredNode: '7',
      hoverNodeById: new Map([['7', node]]),
      graphRegion: region,
      hoveredSpan: { start: 1000, end: 2000 },
    }),
  ).toEqual(['s7 — 1,000 bp, depth 1.0GRCh38 chr6:1,001-2,000 (rank 0)'])
})
