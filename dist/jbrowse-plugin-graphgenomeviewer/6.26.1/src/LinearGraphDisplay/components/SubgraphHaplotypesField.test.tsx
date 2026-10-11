import { fireEvent, render, screen } from '@testing-library/react'

import SubgraphHaplotypesField from './SubgraphHaplotypesField'

import type { LinearGraphCutModel } from '../model'

function model(haplotypeNames?: string[]) {
  return {
    adapterConfig: { type: 'RgfaTabixAdapter', walksUri: 'chr22' },
    chosenHaplotypes: ['HG002'],
    haplotypeNames,
    setSubgraphHaplotypes: vi.fn(),
    cut: vi.fn(),
  } as unknown as LinearGraphCutModel
}

test("the field offers the haplotypes a walk file's header names", () => {
  const m = model(['HG00097#1', 'HG002#1', 'HG002#2'])
  render(<SubgraphHaplotypesField model={m} />)
  expect(screen.getByText('HG002')).toBeTruthy()
  fireEvent.mouseDown(screen.getByTestId('graph-haplotypes-field'))
  fireEvent.click(screen.getByText('HG00097#1'))
  expect(m.setSubgraphHaplotypes).not.toHaveBeenCalled()
  fireEvent.keyDown(screen.getByTestId('graph-haplotypes-field'), {
    key: 'Escape',
  })
  expect(m.setSubgraphHaplotypes).toHaveBeenCalledWith(['HG002', 'HG00097#1'])
  expect(m.cut).toHaveBeenCalled()
})

test('without names the field takes typed ones', () => {
  const m = model()
  render(<SubgraphHaplotypesField model={m} />)
  const field = screen.getByTestId<HTMLInputElement>('graph-haplotypes-field')
  expect(field.value).toBe('HG002')
  fireEvent.change(field, { target: { value: 'HG002, NA19240#1' } })
  fireEvent.keyDown(field, { key: 'Enter' })
  expect(m.setSubgraphHaplotypes).toHaveBeenCalledWith(['HG002', 'NA19240#1'])
})
