import { COLOR_SCHEME_VALUES } from '@jbrowse/bandage-core/colorSchemes'

import { colorOfScheme, domainOfColor, schemeOfColor } from './nodeColor'

test.each(COLOR_SCHEME_VALUES)('%s survives the trip through a color', s => {
  expect(schemeOfColor(colorOfScheme(s))).toBe(s)
})

test('a color carries its domain', () => {
  const color = colorOfScheme('reference-position', { start: 5, end: 50 })
  expect(color).toEqual({ field: 'position', domainMin: 5, domainMax: 50 })
  expect(domainOfColor(color)).toEqual({ start: 5, end: 50 })
})

test('a color it cannot read is auto', () => {
  expect(schemeOfColor({ field: 'gc' })).toBe('auto')
  expect(schemeOfColor('red')).toBe('auto')
  expect(schemeOfColor(undefined)).toBe('auto')
})
