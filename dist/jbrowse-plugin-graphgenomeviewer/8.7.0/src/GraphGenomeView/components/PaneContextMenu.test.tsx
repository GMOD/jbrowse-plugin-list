import { fireEvent, render, screen } from '@testing-library/react'

import PaneContextMenu from './PaneContextMenu'

import type { GraphPaneModel } from '../model'

const model = {
  nodeLaunchTargets: () => ({}),
  canHighlightInLinearView: false,
  showNodeDetails: vi.fn(),
  walkRowBars: { reference: { name: 'ref' }, rows: [] },
  walkRowLaunchTarget: () => undefined,
  walkRowSamples: undefined,
  liftsWalks: false,
  modeDrawsNodes: false,
  walkLayers: [],
} as unknown as GraphPaneModel

test('a right-click on a node offers its details', () => {
  const onClose = vi.fn()
  render(
    <PaneContextMenu
      model={model}
      at={{ clientX: 10, clientY: 10, nodeId: 's7' }}
      onClose={onClose}
    />,
  )
  fireEvent.click(screen.getByText('Node details'))
  expect(model.showNodeDetails).toHaveBeenCalledWith('s7')
  expect(onClose).toHaveBeenCalled()
})

test('a right-click on a walk row with no contig says why it opens nothing', () => {
  render(
    <PaneContextMenu
      model={model}
      at={{ clientX: 10, clientY: 10, row: 0 }}
      onClose={() => {}}
    />,
  )
  expect(screen.getByText('Linear genome view')).toBeTruthy()
  expect(screen.queryByText('Node details')).toBeNull()
})

test('nothing opens without a right-click', () => {
  render(<PaneContextMenu model={model} at={undefined} onClose={() => {}} />)
  expect(screen.queryByRole('menu')).toBeNull()
})
