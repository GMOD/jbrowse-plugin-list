import { DisplayChromeOverlayProvider } from '@jbrowse/display-ui'
import { fireEvent, render, screen } from '@testing-library/react'

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

// GraphCanvas shows it, with the retry that rebuilds the backend
test('a render error alone is left to the canvas', () => {
  render(
    <GraphStatusChrome
      model={model({ renderError: new Error('context lost') })}
      phase="error"
      drawn={false}
      testid="linear-graph-display"
    >
      <canvas />
    </GraphStatusChrome>,
  )
  expect(screen.queryByText(/context lost/)).toBeNull()
  expect(screen.getByTestId('linear-graph-display').dataset.displayPhase).toBe(
    'error',
  )
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
      data-layout="auto"
    >
      <canvas data-testid="graph-canvas" />
    </GraphStatusChrome>,
  )
  const chrome = screen.getByTestId('linear-graph-display')
  expect(chrome.dataset.displayPhase).toBe('tooLarge')
  expect(chrome.dataset.displayDrawn).toBe('false')
  expect(chrome.dataset.layout).toBe('auto')
  expect(screen.queryByTestId('graph-canvas')).toBeNull()
  expect(screen.getByText(/Region too large for a graph cut/)).toBeTruthy()
  expect(screen.getByText('Force load')).toBeTruthy()
})

// What a host after jbrowse-components 3a5393f5a6 provides: overlays that read
// plain values and callbacks, and print whatever `error` they are handed.
const plainOverlays = {
  ErrorBar: ({ error, onRetry }: { error: unknown; onRetry?: () => void }) => (
    <button onClick={onRetry} disabled={!onRetry}>
      {`error: ${String(error)}`}
    </button>
  ),
  TooLarge: ({
    message,
    onForceLoad,
  }: {
    message: string
    onForceLoad: () => void
  }) => <button onClick={onForceLoad}>{message}</button>,
  Loading: () => null,
  BackgroundProgress: ({ message }: { message: string }) => <i>{message}</i>,
  RenderError: () => null,
}

function renderWithPlainOverlays(
  m: LinearGraphDisplayModel,
  phase: 'ready' | 'error' | 'tooLarge',
) {
  render(
    <DisplayChromeOverlayProvider value={plainOverlays as never}>
      <GraphStatusChrome
        model={m}
        phase={phase}
        drawn={phase === 'ready'}
        testid="linear-graph-display"
      >
        <canvas />
      </GraphStatusChrome>
    </DisplayChromeOverlayProvider>,
  )
}

test('a plain-props host sees no error bar while the graph is fine', () => {
  renderWithPlainOverlays(model(), 'ready')
  expect(screen.queryByText(/error:/)).toBeNull()
})

test('a plain-props host gets the error and a retry that reloads', () => {
  const m = model({ error: new Error('walk fetch failed') })
  renderWithPlainOverlays(m, 'error')
  fireEvent.click(screen.getByText('error: Error: walk fetch failed'))
  expect(m.reload).toHaveBeenCalledOnce()
})

test('a plain-props host gets no retry for a refused cut', () => {
  const error = Object.assign(new Error('Zoom in to see the graph'), {
    regionTooLarge: true,
  })
  renderWithPlainOverlays(model({ error }), 'error')
  expect(
    screen.getByText('error: Error: Zoom in to see the graph'),
  ).toHaveProperty('disabled', true)
})

test('a plain-props host gets the zoom-in notice text and a force load', () => {
  const forceLoad = vi.fn()
  renderWithPlainOverlays(
    model({
      regionTooLargeReason: 'Region too large for a graph cut (6 Mb, max 5 Mb)',
      forceLoad,
    }),
    'tooLarge',
  )
  fireEvent.click(
    screen.getByText(/^Region too large for a graph cut.*Zoom in/),
  )
  expect(forceLoad).toHaveBeenCalledOnce()
})

test('a plain-props host sees the background chip only with a status message', () => {
  renderWithPlainOverlays(model({ statusMessage: 'Laying out' }), 'ready')
  expect(screen.getByText('Laying out')).toBeTruthy()
})
