import { fireEvent, render, screen } from '@testing-library/react'

import GraphGenomeView from './GraphGenomeView'

import type { GraphGenomeViewModel } from '../model'

// A canvas needs a rendering backend jsdom has none of
vi.mock('./GraphCanvas', () => ({ default: () => <div>canvas</div> }))

function view(state: Partial<GraphGenomeViewModel>) {
  const model = {
    hasGraph: false,
    isLoading: false,
    loadCanceled: false,
    canRetryLoad: false,
    statusMessage: '',
    error: undefined,
    cancelLoad: vi.fn(),
    retryLoad: vi.fn(),
    ...state,
  }
  render(<GraphGenomeView model={model as unknown as GraphGenomeViewModel} />)
  return model
}

function importFormHidden() {
  return screen.getByText('Load a GFA graph').closest('[hidden]') !== null
}

test('a view with nothing to load offers the import form', () => {
  view({})
  expect(screen.queryByTestId('graph-genome-loading')).toBeNull()
  expect(importFormHidden()).toBe(false)
})

test('a view fetching its first graph shows the loading state instead', () => {
  const model = view({ isLoading: true, statusMessage: 'Fetching subgraph' })
  expect(screen.getByTestId('graph-genome-loading').textContent).toContain(
    'Fetching subgraph',
  )
  expect(importFormHidden()).toBe(true)

  fireEvent.click(screen.getByTestId('graph-genome-cancel'))
  expect(model.cancelLoad).toHaveBeenCalled()
})

test('a launched view whose cut failed offers a retry, not the import form', () => {
  const model = view({
    canRetryLoad: true,
    error: new Error('Region too large'),
  })
  expect(screen.getByText(/Region too large/)).toBeTruthy()
  expect(screen.queryByText('Load a GFA graph')).toBeNull()

  fireEvent.click(screen.getByTestId('reload_button'))
  expect(model.retryLoad).toHaveBeenCalled()
})

test('a launched view whose load was canceled offers a retry', () => {
  const model = view({ canRetryLoad: true, loadCanceled: true })
  expect(screen.getByTestId('graph-genome-load-canceled')).toBeTruthy()

  fireEvent.click(screen.getByTestId('graph-genome-retry'))
  expect(model.retryLoad).toHaveBeenCalled()
})

test('a canceled import goes back to the form', () => {
  view({ loadCanceled: true })
  expect(screen.queryByTestId('graph-genome-load-canceled')).toBeNull()
  expect(importFormHidden()).toBe(false)
})

test('a reload over a drawn graph keeps the canvas', () => {
  view({ hasGraph: true, isLoading: true })
  expect(screen.getByText('canvas')).toBeTruthy()
  expect(screen.queryByTestId('graph-genome-loading')).toBeNull()
})
