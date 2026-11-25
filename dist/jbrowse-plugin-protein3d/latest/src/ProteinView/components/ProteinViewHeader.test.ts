// @vitest-environment jsdom
import { createElement } from 'react'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import stateModelFactory from '../model'
import ProteinViewHeader from './ProteinViewHeader'

import type * as JBrowseCoreUtil from '@jbrowse/core/util'

vi.mock('@jbrowse/core/util', async importActual => {
  const actual = await importActual<typeof JBrowseCoreUtil>()
  return { ...actual, getSession: () => ({ hovered: undefined, views: [] }) }
})

const ProteinView = stateModelFactory()

afterEach(() => {
  cleanup()
})

const ENTITIES = [
  {
    entityId: '1',
    seq: 'SSSVPSQ',
    seqIds: [1, 2, 3, 4, 5, 6, 7],
    authSeqIds: [94, 95, 96, 97, 98, 99, 100],
    chains: ['A'],
  },
]

function renderHeader(transcript?: string) {
  const view = ProteinView.create({
    type: 'ProteinView',
    structures: [{ url: 'a.cif', userProvidedTranscriptSequence: transcript }],
  })
  const structure = view.structures[0]!
  structure.setStructureData({ entities: ENTITIES })
  render(createElement(ProteinViewHeader, { model: view }))
  return structure
}

function rowKeys() {
  return [...document.querySelectorAll('[data-row]')].map(row =>
    row.getAttribute('data-row'),
  )
}

test('a structure with no transcript draws its own sequence and ruler, with no GENOME row', () => {
  const structure = renderHeader()
  expect(screen.getByTestId('protein-alignment-panel')).toBeTruthy()
  expect(rowKeys()).toEqual(['structure', 'ruler'])
  expect(screen.queryByText('GENOME')).toBeNull()
  expect(screen.getByText('STRUCT')).toBeTruthy()
  expect(screen.getByText('100')).toBeTruthy()

  const rows = screen.getByTestId('alignment-rows')
  rows.getBoundingClientRect = () => DOMRect.fromRect({ x: 0, width: 100 })
  const at = (col: number) => ({
    clientX: (col + 0.5) * structure.columnWidth,
  })
  fireEvent.mouseMove(rows, at(6))
  expect(structure.hoverLabelSeqIds).toEqual([7])

  const structRow = document.querySelector('[data-row="structure"]')!
  structRow.getBoundingClientRect = rows.getBoundingClientRect
  fireEvent.click(structRow, at(3))
  expect(structure.clickedStructureRanges).toEqual([{ start: 3, end: 4 }])
})

test('a structure with a transcript draws no panel until it is aligned', () => {
  renderHeader('MKAA')
  expect(screen.queryByTestId('protein-alignment-panel')).toBeNull()
})
