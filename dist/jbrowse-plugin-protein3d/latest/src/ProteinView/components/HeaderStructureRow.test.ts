// @vitest-environment jsdom
import { createElement } from 'react'

import { createTheme } from '@mui/material/styles'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { parseStructure } from '../../test_data/molstarStructure'
import stateModelFactory from '../model'
import HeaderStructureRows from './HeaderStructureRow'

import type * as JBrowseCoreUtil from '@jbrowse/core/util'

vi.mock('@jbrowse/core/util', async importActual => {
  const actual = await importActual<typeof JBrowseCoreUtil>()
  return { ...actual, getSession: () => ({ hovered: undefined, views: [] }) }
})

const ProteinView = stateModelFactory()
const { palette } = createTheme()

function statusColor() {
  return getComputedStyle(screen.getByTestId('structure-status')).color
}

function rgb(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  return `rgb(${r}, ${g}, ${b})`
}

afterEach(() => {
  cleanup()
})

test('a note on a structure is not drawn as an error', () => {
  const view = ProteinView.create({
    type: 'ProteinView',
    structures: [{ url: 'a.cif' }],
  })
  view.structures[0]!.setAlignmentSkipped('This structure has no chain')
  render(createElement(HeaderStructureRows, { model: view }))
  expect(statusColor()).not.toBe(rgb(palette.error.main))
})

test('a failed load offers Retry, and Retry asks for another attempt', () => {
  const view = ProteinView.create({
    type: 'ProteinView',
    structures: [{ url: 'a.cif' }],
  })
  const [structure] = view.structures
  structure!.setLoadError(new Error('404'))
  render(createElement(HeaderStructureRows, { model: view }))
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(structure!.loadAttempt).toBe(1)
})

test('a failed alignment offers no Retry, even once its structure is unloaded', async () => {
  const view = ProteinView.create({
    type: 'ProteinView',
    structures: [{ url: 'a.cif' }],
  })
  view.structures[0]!.setStructureData({
    molstarStructures: [
      await parseStructure([{ asym: 'A', entity: '1', residues: ['MET'] }]),
    ],
  })
  view.structures[0]!.setError(new Error('worker died'))
  view.structures[0]!.clearMolstarStructures()
  render(createElement(HeaderStructureRows, { model: view }))
  expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull()
})

test('only a view of several structures offers to remove one', () => {
  const view = ProteinView.create({
    type: 'ProteinView',
    structures: [{ url: 'a.cif' }],
  })
  render(createElement(HeaderStructureRows, { model: view }))
  expect(screen.queryByRole('button', { name: /^Remove / })).toBeNull()
  cleanup()
  view.addStructure({ url: 'b.cif' })
  render(createElement(HeaderStructureRows, { model: view }))
  expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(2)
})

test('a failed structure is drawn as an error', () => {
  const view = ProteinView.create({
    type: 'ProteinView',
    structures: [{ url: 'a.cif' }],
  })
  view.structures[0]!.setError(new Error('404'))
  render(createElement(HeaderStructureRows, { model: view }))
  expect(statusColor()).toBe(rgb(palette.error.main))
})

// A long file name is capped so the row's buttons stay on it. The label does
// not shrink with the row: any fraction of a pixel taken from it turns "1TUP"
// into "1T…" while the description beside it still has room to give.
test('a structure label is capped, never shrunk, and carries its full text as a title', () => {
  const name = 'a_very_long_structure_file_name_from_a_lab_share.cif'
  const view = ProteinView.create({
    type: 'ProteinView',
    structures: [{ data: 'ATOM', fileName: name }],
  })
  render(createElement(HeaderStructureRows, { model: view }))
  const label = screen.getByText(name)
  expect(label.getAttribute('title')).toBe(name)
  const { flexShrink, maxWidth } = getComputedStyle(label)
  expect(flexShrink).toBe('0')
  expect(maxWidth).toBe('50%')
})
