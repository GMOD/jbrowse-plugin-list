import { act, fireEvent, render, screen } from '@testing-library/react'
import { observable, runInAction } from 'mobx'

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

test('a pick made by keyboard survives the field losing focus', () => {
  const m = model(['HG002#1', 'HG002#2', 'NA19240#1'])
  render(<SubgraphHaplotypesField model={m} />)
  const field = screen.getByTestId('graph-haplotypes-field')
  fireEvent.mouseDown(field)
  fireEvent.keyDown(field, { key: 'ArrowDown' })
  fireEvent.keyDown(field, { key: 'Enter' })
  fireEvent.blur(field)
  expect(m.setSubgraphHaplotypes).toHaveBeenLastCalledWith(['HG002', 'HG002#1'])
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

// A model whose set re-renders the field, as the display's does
function liveModel(haplotypeNames?: string[]) {
  const m = observable({
    sourceAdapter: { type: 'RgfaTabixAdapter', walksUri: 'chr22' },
    cutHaplotypes: ['HG002'],
    haplotypeNames,
    setSubgraphHaplotypes(haplotypes: string[]) {
      m.cutHaplotypes = haplotypes
    },
    recut: vi.fn(),
  })
  return m as unknown as LinearGraphCutModel & { cutHaplotypes: string[] }
}

test('applying from the field keeps its focus', () => {
  const m = liveModel()
  render(<SubgraphHaplotypesField model={m} />)
  const field = screen.getByTestId<HTMLInputElement>('graph-haplotypes-field')
  field.focus()
  fireEvent.change(field, { target: { value: 'HG002, NA19240#1' } })
  fireEvent.keyDown(field, { key: 'Enter' })
  expect(m.cutHaplotypes).toEqual(['HG002', 'NA19240#1'])
  expect(screen.getByTestId('graph-haplotypes-field')).toBe(field)
  expect(document.activeElement).toBe(field)
})

test('a set changed elsewhere resets the draft', () => {
  const m = liveModel()
  render(<SubgraphHaplotypesField model={m} />)
  act(() => {
    runInAction(() => {
      m.cutHaplotypes = ['HG00097#1']
    })
  })
  expect(
    screen.getByTestId<HTMLInputElement>('graph-haplotypes-field').value,
  ).toBe('HG00097#1')
})
