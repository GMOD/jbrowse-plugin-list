// @vitest-environment node
import { gzipSync } from 'node:zlib'

import { gfaText } from './gfaText'

const GFA = 'S\t1\tACGT\n'

test('a GFA reads as its text, gzipped or not', async () => {
  expect(await gfaText(new TextEncoder().encode(GFA))).toBe(GFA)
  expect(await gfaText(gzipSync(GFA))).toBe(GFA)
})
