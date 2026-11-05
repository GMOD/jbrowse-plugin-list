import { expect, test } from 'vitest'

import { parseUniProtGff } from './useUniProtFeatures'

const row = (note: string) =>
  ['P04637', 'UniProtKB', 'Domain', '102', '292', '.', '.', '.', note].join(
    '\t',
  )

test('a note decodes its escapes', () => {
  expect(parseUniProtGff(row('Note=DNA%2Dbinding'))[0]?.description).toBe(
    'DNA-binding',
  )
})

test('a malformed escape keeps its raw text rather than failing the track', () => {
  const features = parseUniProtGff(
    `${row('Note=50%25 then 7%')}\n${row('Note=intact')}`,
  )
  expect(features.map(f => f.description)).toEqual(['50%25 then 7%', 'intact'])
})
