import { render, screen } from '@testing-library/react'

import GraphStatusChrome from './GraphStatusChrome'

import type { LinearGraphDisplayModel } from '../model'

function model(over: Record<string, unknown> = {}) {
  return {
    configuration: { displayId: 'graph-LinearGraphDisplay' },
    height: 300,
    error: undefined,
    regionTooLargeReason: '',
    zoomCanReleaseGate: true,
    statusMessage: undefined,
    statusProgress: undefined,
    fetchCanceled: false,
    reload: vi.fn(),
    ...over,
  } as unknown as LinearGraphDisplayModel
}

test('a drawn graph sits in the chrome with its readiness attributes', () => {
  render(
    <GraphStatusChrome
      model={model()}
      phase="ready"
      drawn
      testid="linear-graph-display"
      data-layout="auto"
    >
      <canvas data-testid="graph-canvas" />
    </GraphStatusChrome>,
  )
  const chrome = screen.getByTestId('linear-graph-display')
  expect(chrome.dataset.displayPhase).toBe('ready')
  expect(chrome.dataset.displayDrawn).toBe('true')
  expect(chrome.dataset.layout).toBe('auto')
  expect(screen.getByTestId('graph-canvas')).toBeTruthy()
})

test('a refused cut shows its notice over the graph', () => {
  const error = Object.assign(
    new Error('Zoom in to about 54Kbp to see the graph'),
    { name: 'NodeLimitError', regionTooLarge: true },
  )
  render(
    <GraphStatusChrome
      model={model({ error })}
      phase="error"
      drawn={false}
      testid="linear-graph-display"
    >
      <canvas />
    </GraphStatusChrome>,
  )
  expect(
    screen.getByText(/Zoom in to about 54Kbp to see the graph/),
  ).toBeTruthy()
})

test('a window past the bp cap replaces the graph with the zoom-in notice', () => {
  render(
    <GraphStatusChrome
      model={model({
        regionTooLargeReason:
          'Region too large for a graph cut (6 Mb, max 5 Mb)',
      })}
      phase="tooLarge"
      drawn={false}
      testid="linear-graph-display"
    >
      <canvas data-testid="graph-canvas" />
    </GraphStatusChrome>,
  )
  expect(screen.queryByTestId('graph-canvas')).toBeNull()
  expect(screen.getByText(/Region too large for a graph cut/)).toBeTruthy()
  expect(screen.getByText('Force load')).toBeTruthy()
})
