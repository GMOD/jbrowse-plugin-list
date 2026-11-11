import { fireEvent, render, screen } from '@testing-library/react'

import ImportForm from './ImportForm'

import type { GraphGenomeViewModel } from '../viewModel'

function renderForm() {
  const model = {
    error: undefined,
    loadGFAFile: vi.fn(),
    openGfaLocation: vi.fn(),
    loadGFA: vi.fn(),
  }
  render(<ImportForm model={model as unknown as GraphGenomeViewModel} />)
  return { model, form: screen.getByTestId('graph-import-form') }
}

test('a file dropped on the form loads as the file button would', () => {
  const { model, form } = renderForm()
  const file = new File(['S\t1\tACGT\n'], 'small.gfa')
  fireEvent.drop(form, { dataTransfer: { files: [file], types: ['Files'] } })
  expect(model.loadGFAFile).toHaveBeenCalledWith(file, 'small.gfa')
})

test('a file dragged over the form outlines it until it leaves', () => {
  const { form } = renderForm()
  const before = form.className
  fireEvent.dragOver(form, { dataTransfer: { types: ['Files'] } })
  expect(form.className).not.toBe(before)
  fireEvent.dragLeave(form)
  expect(form.className).toBe(before)
})

test('a drop with no file loads nothing', () => {
  const { model, form } = renderForm()
  fireEvent.drop(form, { dataTransfer: { files: [], types: [] } })
  expect(model.loadGFAFile).not.toHaveBeenCalled()
})
