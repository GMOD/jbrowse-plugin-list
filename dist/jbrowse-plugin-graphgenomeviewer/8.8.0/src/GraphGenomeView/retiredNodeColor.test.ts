import { liftFlatNodeColor } from './retiredNodeColor'

test('a bare constant becomes a value', () => {
  expect(liftFlatNodeColor('grey')).toEqual({ value: 'grey' })
  expect(liftFlatNodeColor('uniform')).toEqual({ value: 'uniform' })
})

test('categorical becomes an ordinal scale', () => {
  expect(liftFlatNodeColor({ field: 'id', scale: 'categorical' })).toEqual({
    field: 'id',
    scale: { type: 'ordinal' },
  })
})

test('scheme and the domain move under scale', () => {
  expect(liftFlatNodeColor({ field: 'id', scheme: 'rainbow' })).toEqual({
    field: 'id',
    scale: { scheme: 'rainbow' },
  })
  expect(
    liftFlatNodeColor({ field: 'position', domainMin: 5, domainMax: 50 }),
  ).toEqual({ field: 'position', scale: { domainMin: 5, domainMax: 50 } })
})

test('labels and title move to scale.names and legend.title', () => {
  expect(
    liftFlatNodeColor({ field: 'id', labels: ['a'], title: 'Node' }),
  ).toEqual({ field: 'id', scale: { names: ['a'] }, legend: { title: 'Node' } })
})

test('a member the channel object already nests wins over its flat twin', () => {
  expect(
    liftFlatNodeColor({
      field: 'position',
      domainMin: 1,
      scale: { domainMin: 7 },
    }),
  ).toEqual({ field: 'position', scale: { domainMin: 7 } })
})

test('a channel object is the object it was', () => {
  const color = { field: 'position', scale: { domainMin: 1, domainMax: 2 } }
  expect(liftFlatNodeColor(color)).toBe(color)
  expect(liftFlatNodeColor({ field: 'depth' })).toEqual({ field: 'depth' })
  expect(liftFlatNodeColor(undefined)).toBeUndefined()
})
