import { describe, expect, it } from 'vitest'

import { bubbleSegmentIds, classifyBubble, formatBp } from './classifyBubble'

import type { MinigraphBubble } from '../../MinigraphBubbleAdapter/bubbleLine'

function bubble(over: Partial<MinigraphBubble>): MinigraphBubble {
  return {
    refName: 'GRCh38#0#chr6',
    start: 0,
    end: 0,
    segmentCount: 3,
    pathCount: 2,
    inversion: false,
    shortestAlleleLength: 0,
    longestAlleleLength: 0,
    segments: 'a,b,c',
    shortestAllele: undefined,
    longestAllele: undefined,
    ...over,
  }
}

// Real rows from the hosted HPRC release 2.1 bubble index at KIV-2 and MHC.
describe('classifyBubble', () => {
  it('reads a pure insertion off a zero-width interval', () => {
    const c = classifyBubble(
      bubble({
        start: 160535205,
        end: 160535205,
        shortestAlleleLength: 0,
        longestAlleleLength: 1245,
      }),
    )
    expect(c.kind).toBe('insertion')
    expect(c.label).toBe('≤1.2 kb ins')
  })

  it('counts the alleles past two', () => {
    expect(
      classifyBubble(
        bubble({
          start: 100,
          end: 100,
          pathCount: 3,
          shortestAlleleLength: 0,
          longestAlleleLength: 2000,
        }),
      ).label,
    ).toBe('≤2.0 kb ins, 3 alleles')
  })

  it('reads a deletion when the longest route is the reference', () => {
    const c = classifyBubble(
      bubble({
        start: 160588770,
        end: 160593193,
        shortestAlleleLength: 0,
        longestAlleleLength: 4423,
      }),
    )
    expect(c.kind).toBe('deletion')
    expect(c.label).toBe('4.4 kb del')
  })

  it('calls many routes over a wide length range a repeat array', () => {
    const c = classifyBubble(
      bubble({
        start: 160616002,
        end: 160646753,
        segmentCount: 29,
        pathCount: 129,
        shortestAlleleLength: 3018,
        longestAlleleLength: 174966,
      }),
    )
    expect(c.kind).toBe('repeat')
    expect(c.label).toBe('3.0–175 kb repeat array, 129 routes')
  })

  it('names a saturated route count for what it is', () => {
    const c = classifyBubble(
      bubble({
        start: 32486309,
        end: 32575299,
        segmentCount: 254,
        pathCount: 2147483647,
        shortestAlleleLength: 2423,
        longestAlleleLength: 205170,
      }),
    )
    expect(c.kind).toBe('superbubble')
    expect(c.label).toBe('2.4–205 kb superbubble, 254 segments, ≥2.1B routes')
  })

  it('reads a SNP and a substitution', () => {
    expect(
      classifyBubble(
        bubble({
          start: 10,
          end: 11,
          shortestAlleleLength: 1,
          longestAlleleLength: 1,
        }),
      ).kind,
    ).toBe('snp')
    expect(
      classifyBubble(
        bubble({
          start: 10,
          end: 14,
          shortestAlleleLength: 4,
          longestAlleleLength: 4,
        }),
      ).label,
    ).toBe('4 bp sub')
  })

  it('flags an inversion ahead of everything but a superbubble', () => {
    const c = classifyBubble(
      bubble({
        inversion: true,
        shortestAlleleLength: 100,
        longestAlleleLength: 900,
      }),
    )
    expect(c.kind).toBe('inversion')
    expect(c.label).toBe('900 bp inv')
  })

  it('states the reference a complex site replaces and its allele range', () => {
    const c = classifyBubble(
      bubble({
        start: 0,
        end: 12000,
        pathCount: 9,
        shortestAlleleLength: 8600,
        longestAlleleLength: 13000,
      }),
    )
    expect(c.kind).toBe('complex')
    expect(c.label).toBe('12 kb ref → 8.6–13 kb, 9 alleles')
  })

  it('marks a bubble the cut did not hold whole', () => {
    expect(
      classifyBubble(
        bubble({
          start: 0,
          end: 41000,
          shortestAlleleLength: 41000,
          longestAlleleLength: 41000,
          partial: true,
        }),
      ).label,
    ).toBe('41 kb sub, partial')
  })

  it('formats bp the way the node labels do', () => {
    expect(formatBp(58)).toBe('58 bp')
    expect(formatBp(1245)).toBe('1.2 kb')
    expect(formatBp(174966)).toBe('175 kb')
  })

  it('splits the segment list', () => {
    expect(bubbleSegmentIds(bubble({ segments: 's1,s2,s3' }))).toEqual([
      's1',
      's2',
      's3',
    ])
  })
})
