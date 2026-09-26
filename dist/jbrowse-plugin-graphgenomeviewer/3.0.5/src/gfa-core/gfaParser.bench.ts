import { describe, test } from 'vitest'

import { parseGFA } from './gfaParser'

// `pnpm bench`. The parse is a one-off per graph rather than a per-frame pass,
// but it is the one-off the user waits through with nothing on screen, and the
// two GFA dialects load through completely different code here: an rGFA is
// segments and links, while a Minigraph-Cactus graph puts one haplotype's whole
// chromosome walk in a single W field, so its cost is nearly all in
// `parseWalkBody`.
//
// Vitest 5 moved `bench` from a top-level export to a test-context fixture:
// each measurement is a `test()` that awaits `bench(name, fn).run()`.

function segments(count: number) {
  return Array.from(
    { length: count },
    (_, i) => `S\ts${i}\t*\tLN:i:${100 + (i % 900)}`,
  ).join('\n')
}

function links(count: number) {
  return Array.from(
    { length: count },
    (_, i) => `L\ts${i}\t+\ts${i + 1}\t+\t0M`,
  ).join('\n')
}

function walk(steps: number) {
  let body = ''
  for (let i = 0; i < steps; i++) {
    body += `${i % 3 ? '>' : '<'}s${i}`
  }
  return `W\tHG00438\t1\tchr1\t0\t${steps * 100}\t${body}`
}

describe('parseGFA', () => {
  const rgfa = `H\tVN:Z:1.0\n${Array.from(
    { length: 20_000 },
    (_, i) =>
      `S\ts${i}\t*\tLN:i:${100 + (i % 900)}\tSN:Z:chr1\tSO:i:${i * 100}\tSR:i:${i % 3}`,
  ).join('\n')}\n${links(19_999)}`
  test('rGFA, 20k tagged segments', async ({ bench }) => {
    await bench('rGFA, 20k tagged segments', () => {
      parseGFA(rgfa)
    }).run()
  })

  const walked = `H\tVN:Z:1.1\n${segments(20_000)}\n${links(19_999)}\n${walk(200_000)}`
  test('GFA1 with a 200k-step W record', async ({ bench }) => {
    await bench('GFA1 with a 200k-step W record', () => {
      parseGFA(walked)
    }).run()
  })
})
