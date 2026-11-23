import { haplotypeColorsOf } from './haplotypeColors'

test('a walk drawn in one colour publishes it by sample and haplotype, a ramped walk nothing', () => {
  expect(
    haplotypeColorsOf([
      { name: 'dm6#0#chr2L', encoding: { field: 'walk', scheme: 'grey' } },
      {
        name: 'Canton-S_A1#1#chr2L',
        encoding: { field: 'walk', scheme: 'blue', value: '#1f77b4' },
      },
      {
        name: 'HG002#2#chr6[100-900]',
        encoding: { field: 'walk', scheme: 'red' },
      },
      {
        name: 'BOG1_A2#1#chr2L',
        encoding: { field: 'progress', scheme: 'purple' },
      },
    ]),
  ).toEqual([
    { sample: 'dm6', haplotype: 0, color: expect.any(String) },
    { sample: 'Canton-S_A1', haplotype: 1, color: 'rgb(31, 119, 180)' },
    { sample: 'HG002', haplotype: 2, color: expect.any(String) },
  ])
})

test('a folded thread colours every haplotype on it', () => {
  expect(
    haplotypeColorsOf([
      {
        name: 'Canton-S_A1#1#chr2L',
        members: ['Canton-S_A1#1#chr2L', 'OreR#1#chr2L'],
        encoding: { field: 'walk', scheme: 'blue', value: '#1f77b4' },
      },
    ]),
  ).toEqual([
    { sample: 'Canton-S_A1', haplotype: 1, color: 'rgb(31, 119, 180)' },
    { sample: 'OreR', haplotype: 1, color: 'rgb(31, 119, 180)' },
  ])
})

test('a walk named by its bare sample publishes no haplotype', () => {
  expect(
    haplotypeColorsOf([
      {
        name: 'HG002',
        encoding: { field: 'walk', scheme: 'blue', value: '#1f77b4' },
      },
    ]),
  ).toStrictEqual([{ sample: 'HG002', color: 'rgb(31, 119, 180)' }])
})
