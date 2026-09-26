import cohort from './test_data/abca7_trgt_walks.json'
import { CALL_TOLERANCE, withCalls } from './walkCalls'

import type { RepeatCall } from './repeatFeatures'

function walk(sample: string, bp: number, complete = true) {
  return { sample, bp, complete }
}

const calls = (...bps: (number | RepeatCall)[]) =>
  bps.map(bp => (typeof bp === 'number' ? { bp } : bp))

test('each haplotype takes its own allele, and one of a pair can disagree', () => {
  const rows = withCalls([walk('HG1', 3161), walk('HG1', 3161)], {
    HG1: calls(387, 3161),
  })
  expect(rows.map(r => r.call?.bp)).toEqual([387, 3161])
  expect(rows.map(r => r.call?.agrees)).toEqual([false, true])
})

// AL comes in the genotype's order, which is the genotyper's: TRGTdb's ABCA7
// record lists the shortest allele first, and a graph's haplotype 1 is not it.
test('the order a record lists its alleles in does not reach the pairing', () => {
  const short = walk('HG1', 388)
  const long = walk('HG1', 3183)
  for (const listed of [calls(387, 3161), calls(3161, 387)]) {
    expect(
      withCalls([short, long], { HG1: listed }).map(r => r.call?.bp),
    ).toEqual([387, 3161])
    expect(
      withCalls([long, short], { HG1: listed }).map(r => r.call?.bp),
    ).toEqual([3161, 387])
  }
})

test('an allele no read spanned is shown against its walk and never scored', () => {
  const rows = withCalls([walk('HG02559', 5525), walk('HG02559', 493)], {
    HG02559: calls(
      { bp: 491, spanningReads: 1 },
      { bp: 491, spanningReads: 0 },
    ),
  })
  expect(rows.map(r => r.call)).toEqual([
    { bp: 491, spanningReads: 0, agrees: undefined },
    { bp: 491, spanningReads: 1, agrees: true },
  ])
})

// HG00323's two walks against a genotype whose second allele has no spanning
// read: the walk the read-backed call fits keeps the verdict wherever the two
// equal lengths sit, because the backed allele is paired first.
test('the read-backed allele is paired on merit, not on tie order', () => {
  for (const listed of [
    calls({ bp: 2640, spanningReads: 1 }, { bp: 2640, spanningReads: 0 }),
    calls({ bp: 2640, spanningReads: 0 }, { bp: 2640, spanningReads: 1 }),
  ]) {
    const rows = withCalls([walk('HG1', 1642), walk('HG1', 2639)], {
      HG1: listed,
    })
    expect(rows.map(r => r.call?.spanningReads)).toEqual([0, 1])
    expect(rows.map(r => r.call?.agrees)).toEqual([undefined, true])
  }
})

test('a walk that does not span the array keeps its tick and gets no verdict', () => {
  const rows = withCalls(
    [walk('HG04199', 1476), walk('HG04199', 3655, false)],
    { HG04199: calls(1485, 8614) },
  )
  expect(rows.map(r => r.call?.bp)).toEqual([1485, 8614])
  expect(rows.map(r => r.call?.agrees)).toEqual([true, undefined])
})

// HG02976 at ABCA7: one walk spans the array and lands on the longer allele
// almost exactly, the other stops inside it. Paired on length alone the one
// that stops takes the allele that fits, and the walk that spans reads as a
// disagreement against what is left.
test("a walk that stops inside the array cannot take a spanning walk's allele", () => {
  const rows = withCalls(
    [walk('HG02976', 2884), walk('HG02976', 3653, false)],
    {
      HG02976: calls(2274, 2886),
    },
  )
  expect(rows.map(r => r.call?.bp)).toEqual([2886, 2274])
  expect(rows.map(r => r.call?.agrees)).toEqual([true, undefined])
})

test('a surplus walk or an uncalled sample carries no call', () => {
  const rows = withCalls(
    [walk('HG1', 400), walk('HG1', 2000), walk('HG1', 4000), walk('HG2', 900)],
    { HG1: calls(390, 4010) },
  )
  expect(rows.map(r => r.call?.bp)).toEqual([390, undefined, 4010, undefined])
  expect(withCalls([walk('HG1', 400)], undefined)[0]!.call).toBeUndefined()
})

// Where CALL_TOLERANCE comes from. test_data holds every walk the HPRC graph
// draws through the ABCA7 VNTR beside TRGT's genotype of the same sample, and
// the two verdicts land in bands with a gap between them, so any threshold
// across the gap sorts the cohort the same way. The counts are there to say
// what a change moved.
test('the threshold falls in a gap the ABCA7 cohort leaves empty', () => {
  const rows = withCalls(cohort.rows, cohort.calls)
  const apart = (r: (typeof rows)[number]) =>
    Math.abs(r.call!.bp - r.bp) / Math.max(r.call!.bp, r.bp)
  const scored = rows.filter(r => r.call?.agrees !== undefined)
  const near = scored.filter(r => r.call!.agrees)
  const far = scored.filter(r => !r.call!.agrees)
  expect(Math.max(...near.map(apart))).toBeLessThan(0.08)
  expect(Math.min(...far.map(apart))).toBeGreaterThan(0.14)
  expect(CALL_TOLERANCE).toBeGreaterThan(0.08)
  expect(CALL_TOLERANCE).toBeLessThan(0.14)
  expect({
    agrees: near.length,
    apart: far.length,
    unbacked: rows.filter(r => r.call?.spanningReads === 0).length,
    partial: rows.filter(r => r.call && !r.complete).length,
    uncalled: rows.filter(r => !r.call).length,
  }).toEqual({
    agrees: 142,
    apart: 24,
    unbacked: 18,
    partial: 2,
    uncalled: 0,
  })
})
