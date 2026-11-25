// @vitest-environment jsdom
import { createElement } from 'react'

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import stateModelFactory from '../model'
import RangeBar, { RangeBarTrack, rangeText } from './RangeBar'

import type * as JBrowseCoreUtil from '@jbrowse/core/util'

vi.mock('@jbrowse/core/util', async importActual => {
  const actual = await importActual<typeof JBrowseCoreUtil>()
  return { ...actual, getSession: () => ({ hovered: undefined, views: [] }) }
})

const ProteinView = stateModelFactory()

afterEach(() => {
  cleanup()
})

// drawn out of residue order, as a track's lanes may draw them
const BARS = [
  { name: 'Helix 20-25', start: 20, end: 25 },
  { name: 'Helix 3-7', start: 3, end: 7 },
  { name: 'Helix 10-12', start: 10, end: 12 },
]

function renderTrack(onClick: (name: string) => void = () => {}) {
  const view = ProteinView.create({
    type: 'ProteinView',
    structures: [{ url: 'a.cif' }],
  })
  const model = view.structures[0]!
  render(
    createElement(
      RangeBarTrack,
      null,
      BARS.map(({ name, start, end }) =>
        createElement(RangeBar, {
          key: name,
          alignmentStart: start,
          alignmentEnd: end,
          top: 0,
          height: '100%',
          color: 'red',
          selected: false,
          tabStop: start === 3,
          tooltip: name,
          ariaLabel: name,
          dataAttributes: { 'data-testid': 'bar' },
          onClick: () => {
            onClick(name)
          },
          model,
        }),
      ),
    ),
  )
  return {
    model,
    bar: (name: string) => screen.getByRole('button', { name }),
  }
}

test('names one residue alone and several as a range', () => {
  expect(rangeText(248, 248)).toBe('248')
  expect(rangeText(245, 250)).toBe('245-250')
})

// p53 draws about 1,400 bars, each of which used to be a tab stop
test('a track is one tab stop', () => {
  const { bar } = renderTrack()
  expect(BARS.map(({ name }) => bar(name).tabIndex)).toEqual([-1, 0, -1])
})

test('the arrow keys move focus between a track’s bars in residue order', () => {
  const { bar } = renderTrack()
  act(() => {
    bar('Helix 3-7').focus()
  })
  fireEvent.keyDown(bar('Helix 3-7'), { key: 'ArrowRight' })
  expect(document.activeElement).toBe(bar('Helix 10-12'))
  fireEvent.keyDown(bar('Helix 10-12'), { key: 'ArrowRight' })
  expect(document.activeElement).toBe(bar('Helix 20-25'))
  fireEvent.keyDown(bar('Helix 20-25'), { key: 'ArrowRight' })
  expect(document.activeElement).toBe(bar('Helix 20-25'))
  fireEvent.keyDown(bar('Helix 20-25'), { key: 'ArrowLeft' })
  expect(document.activeElement).toBe(bar('Helix 10-12'))
})

test('Enter or Space activates a bar', () => {
  const onClick = vi.fn()
  const { bar } = renderTrack(onClick)
  fireEvent.keyDown(bar('Helix 10-12'), { key: 'Enter' })
  fireEvent.keyDown(bar('Helix 10-12'), { key: ' ' })
  fireEvent.keyDown(bar('Helix 10-12'), { key: 'a' })
  fireEvent.click(bar('Helix 10-12'))
  expect(onClick.mock.calls).toEqual([
    ['Helix 10-12'],
    ['Helix 10-12'],
    ['Helix 10-12'],
  ])
})

test('reaching a bar by keyboard lights its columns as a hover does', () => {
  const { model, bar } = renderTrack()
  act(() => {
    bar('Helix 3-7').focus()
  })
  expect(model.alignmentHoverRange).toEqual({ start: 3, end: 7 })
  act(() => {
    bar('Helix 3-7').blur()
  })
  expect(model.alignmentHoverRange).toBeUndefined()
})
