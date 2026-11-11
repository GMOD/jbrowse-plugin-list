import { fireEvent, render, screen } from '@testing-library/react'

import GraphLoadStatus from './GraphLoadStatus'

import type { GraphGenomeViewModel } from '../viewModel'

function stub(state: Record<string, unknown>) {
  return {
    error: undefined,
    loadCanceled: false,
    statusMessage: '',
    canCancelLoad: false,
    retryLoad: vi.fn(),
    clearGraph: vi.fn(),
    ...state,
  }
}

test('a failed source offers a way back to the import form', () => {
  const model = stub({ error: new Error('404 on graph.gfa') })
  render(<GraphLoadStatus model={model as unknown as GraphGenomeViewModel} />)
  fireEvent.click(screen.getByText('Choose another graph'))
  expect(model.clearGraph).toHaveBeenCalledTimes(1)
  expect(model.retryLoad).not.toHaveBeenCalled()
})

test('a canceled load offers a way back beside Retry', () => {
  const model = stub({ loadCanceled: true })
  render(<GraphLoadStatus model={model as unknown as GraphGenomeViewModel} />)
  expect(screen.getByTestId('graph-genome-retry')).toBeTruthy()
  fireEvent.click(screen.getByText('Choose another graph'))
  expect(model.clearGraph).toHaveBeenCalledTimes(1)
})

test('a running load offers only Cancel', () => {
  render(
    <GraphLoadStatus model={stub({}) as unknown as GraphGenomeViewModel} />,
  )
  expect(screen.queryByText('Choose another graph')).toBeNull()
})
