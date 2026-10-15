import { fireEvent, render, screen } from '@testing-library/react'

import SubgraphHaplotypesField from './SubgraphHaplotypesField'

import type { LinearGraphCutModel } from '../model'

function model(haplotypeNames?: string[]) {
  return {
    sourceAdapter: { type: 'RgfaTabixAdapter', walksUri: 'chr22' },
    cutHaplotypes: ['HG002'],
    haplotypeNames,
    setSubgraphHaplotypes: vi.fn(),
    recut: vi.fn(),
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
  expect(m.recut).toHaveBeenCalled()
})

test('a typed prefix left in the box applies when the box loses focus', () => {
  const m = model(['HG002#1', 'HG002#2', 'NA19240#1'])
  render(<SubgraphHaplotypesField model={m} />)
  const field = screen.getByTestId('graph-haplotypes-field')
  fireEvent.mouseDown(field)
  fireEvent.change(field, { target: { value: 'NA19240' } })
  fireEvent.blur(field)
  expect(m.setSubgraphHaplotypes).toHaveBeenCalledWith(['HG002', 'NA19240'])
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
