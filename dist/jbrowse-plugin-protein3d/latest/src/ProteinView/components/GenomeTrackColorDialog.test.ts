// @vitest-environment jsdom
import { createElement } from 'react'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import stateModelFactory from '../model'
import GenomeTrackColorDialog from './GenomeTrackColorDialog'

import type { ProteinColor } from '../proteinColor'
import type * as JBrowseCoreUtil from '@jbrowse/core/util'

const TRACKS = [
  { trackId: 'vcf', type: 'VariantTrack', name: 'gnomAD' },
  { trackId: 'clinvar', type: 'VariantTrack', name: 'ClinVar' },
  { trackId: 'bw', type: 'QuantitativeTrack', name: 'phyloP' },
]

vi.mock('@jbrowse/core/util', async importActual => {
  const actual = await importActual<typeof JBrowseCoreUtil>()
  return {
    ...actual,
    getSession: () => ({
      hovered: undefined,
      views: [],
      tracks: TRACKS,
      getTrackById: (id: string) => TRACKS.find(t => t.trackId === id),
      assemblyManager: { get: () => undefined },
    }),
    getTrackName: ({ name }: { name: string }) => name,
  }
})

vi.mock('../../trackConfigNode', () => ({ trackConfigNode: () => ({}) }))

const ProteinView = stateModelFactory()

afterEach(() => {
  cleanup()
})

function renderDialog(color: ProteinColor) {
  const view = ProteinView.create({
    type: 'ProteinView',
    structures: [{ url: 'a.cif' }],
    color,
  })
  render(
    createElement(GenomeTrackColorDialog, {
      model: view,
      handleClose: () => {},
    }),
  )
  return view
}

function colorButton() {
  return screen.getByRole('button', { name: 'Color' })
}

test('a variant track asks for the field its score is read from', () => {
  const view = renderDialog({ field: 'track', trackId: 'vcf', stat: 'max' })
  const input = screen.getByLabelText('Score field')
  expect(colorButton()).toHaveProperty('disabled', true)

  fireEvent.change(input, { target: { value: 'jexl:get(feature,"AF")' } })
  expect(colorButton()).toHaveProperty('disabled', true)

  fireEvent.change(input, { target: { value: ' INFO.AF ' } })
  fireEvent.click(colorButton())
  expect(view.color).toMatchObject({
    field: 'track',
    trackId: 'vcf',
    stat: 'max',
    scoreField: 'INFO.AF',
  })
})

test('a blank field says what it needs once it has been typed in', () => {
  renderDialog({ field: 'track', trackId: 'vcf', stat: 'max' })
  const input = screen.getByLabelText('Score field')
  expect(screen.queryByText(/^Name the field/)).toBeNull()
  fireEvent.change(input, { target: { value: '  ' } })
  expect(
    screen.getByText(
      "Name the field holding each variant's number, such as INFO.AF",
    ),
  ).toBeTruthy()
})

// a field one VCF's INFO carries need not exist in another's
test('a stored score field stays with its track', () => {
  renderDialog({
    field: 'track',
    trackId: 'vcf',
    stat: 'max',
    scoreField: 'INFO.AF',
  })
  expect(screen.getByLabelText('Score field')).toHaveProperty(
    'value',
    'INFO.AF',
  )
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Track' }))
  fireEvent.click(screen.getByRole('option', { name: 'ClinVar' }))
  expect(screen.getByLabelText('Score field')).toHaveProperty('value', '')
})

test('a count, or a track scored by its own number, asks for no field', () => {
  renderDialog({ field: 'track', trackId: 'vcf', stat: 'count' })
  expect(screen.queryByLabelText('Score field')).toBeNull()
  cleanup()
  renderDialog({ field: 'track', trackId: 'bw', stat: 'mean' })
  expect(screen.queryByLabelText('Score field')).toBeNull()
})
