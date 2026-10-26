import { COLOR_SCHEME_VALUES } from '@jbrowse/bandage-core/colorSchemes'

import { colorOfScheme, domainOfColor, schemeOfColor } from './nodeColor'

test.each(COLOR_SCHEME_VALUES)('%s survives the trip through a color', s => {
  expect(schemeOfColor(colorOfScheme(s))).toBe(s)
})

test('a color carries its domain', () => {
  const color = colorOfScheme('reference-position', { start: 5, end: 50 })
  expect(color).toEqual({
    field: 'position',
    scale: { domainMin: 5, domainMax: 50 },
  })
  expect(domainOfColor(color)).toEqual({ start: 5, end: 50 })
})

test('a color it cannot read is auto', () => {
  expect(schemeOfColor({ field: 'gc' })).toBe('auto')
  expect(schemeOfColor('red')).toBe('auto')
  expect(schemeOfColor({ value: 'red' })).toBe('auto')
  expect(schemeOfColor(undefined)).toBe('auto')
})

test('a constant is a value and a field is its own member', () => {
  expect(colorOfScheme('grey')).toEqual({ value: 'grey' })
  expect(colorOfScheme('depth')).toEqual({ field: 'depth' })
})

test('the id field reads its scale off the nested scale', () => {
  expect(schemeOfColor({ field: 'id' })).toBe('random')
  expect(schemeOfColor({ field: 'id', scale: { type: 'ordinal' } })).toBe(
    'random',
  )
  expect(schemeOfColor({ field: 'id', scale: { scheme: 'rainbow' } })).toBe(
    'rainbow',
  )
})

test('a flat member beside the field reads as nothing', () => {
  expect(schemeOfColor({ field: 'id', scheme: 'rainbow' })).toBe('random')
  expect(domainOfColor({ field: 'position', domainMin: 1, domainMax: 2 })).toBe(
    undefined,
  )
})
