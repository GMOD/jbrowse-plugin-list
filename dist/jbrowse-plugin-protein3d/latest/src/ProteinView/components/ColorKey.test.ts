// @vitest-environment jsdom
import { createElement } from 'react'

import { cleanup, render, screen } from '@testing-library/react'
import { Color } from 'molstar/lib/mol-util/color'
import { ScaleLegend } from 'molstar/lib/mol-util/legend'
import { afterEach, expect, test } from 'vitest'

import { MolstarLegendKey, words } from './ColorKey'

afterEach(() => {
  cleanup()
})

test('splits Mol*’s camelCase names and leaves case-sensitive ones alone', () => {
  expect(words('alphaHelix')).toBe('alpha helix')
  expect(words('threeTenHelix')).toBe('three ten helix')
  expect(['A', 'a', 'RNA', 'ALA', 'Mapped chain'].map(words)).toEqual([
    'A',
    'a',
    'RNA',
    'ALA',
    'Mapped chain',
  ])
})

const ramp = ScaleLegend('Likely benign 0', 'Likely pathogenic 1', [
  Color(0x3d5a80),
  Color(0xd7191c),
])

test('a ramp key ends with its no-value swatch on the same line', () => {
  render(
    createElement(MolstarLegendKey, {
      title: 'AlphaMissense pathogenicity',
      legend: ramp,
      noValue: { label: 'No value', color: '#cccccc' },
    }),
  )
  const key = screen.getByTestId('structure-legend')
  expect(key.textContent).toBe(
    'AlphaMissense pathogenicity:Likely benign 0Likely pathogenic 1No value',
  )
  const entry = screen.getByText('No value')
  expect(entry.parentElement).toBe(key)
  expect(entry.firstElementChild).toHaveProperty(
    'style.background',
    'rgb(204, 204, 204)',
  )
})

test('a ramp key without a no-value entry is the ramp alone', () => {
  render(
    createElement(MolstarLegendKey, {
      title: 'AlphaMissense pathogenicity',
      legend: ramp,
    }),
  )
  expect(screen.getByTestId('structure-legend').textContent).toBe(
    'AlphaMissense pathogenicity:Likely benign 0Likely pathogenic 1',
  )
})
