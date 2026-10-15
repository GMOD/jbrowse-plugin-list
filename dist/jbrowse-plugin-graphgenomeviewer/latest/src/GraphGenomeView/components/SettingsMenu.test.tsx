import { fireEvent, render, screen } from '@testing-library/react'

import GraphSettingsDialog from './GraphSettingsDialog'
import SettingsMenu from './SettingsMenu'

import type { GraphPaneModel } from '../model'

const queueDialog = vi.fn()
vi.mock('@jbrowse/core/util', async importOriginal => ({
  ...(await importOriginal()),
  getSession: () => ({ queueDialog }),
}))

test('Graph settings opens its dialog through the session', () => {
  const model = {
    highlightMenuItems: () => [],
    layoutOptionMenuItems: () => [],
    showMenuItems: () => [],
    modeDrawsNodes: false,
    walkChoices: [],
    showPerf: false,
  } as unknown as GraphPaneModel
  render(<SettingsMenu model={model} />)
  fireEvent.click(screen.getByRole('button'))
  fireEvent.click(screen.getByText('Graph settings...'))
  const [Dialog, props] = queueDialog.mock.calls[0]![0](() => {})
  expect(Dialog).toBe(GraphSettingsDialog)
  expect(props).toMatchObject({ model })
})
