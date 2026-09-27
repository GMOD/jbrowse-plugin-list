import { layoutLabels } from './labelLayout'

import type { BubbleHalo } from './bubbles/bubbleHalos'
import type { GenePin } from './genes/genePins'
import type { LabelLayoutSource } from './labelLayout'
import type { NodeSegment } from './types'

const bubble = {
  refName: 'chr1',
  start: 0,
  end: 1000,
  segmentCount: 3,
  pathCount: 2,
  inversion: false,
  shortestAlleleLength: 1000,
  longestAlleleLength: 1600,
  segments: 's1,s2,s3',
  shortestAllele: undefined,
  longestAllele: undefined,
}

function halo(labelAt: NodeSegment, routeAt?: NodeSegment): BubbleHalo {
  return {
    bubble,
    kind: 'substitution',
    label: '1.6 kb sub',
    path: '',
    labelAt,
    members: 3,
    nodeIds: ['s2'],
    whole: false,
    routes: routeAt
      ? [
          {
            route: { steps: ['s2'], bp: 1600, walks: ['HG00133#1'] },
            at: routeAt,
            text: 'HG00133',
          },
        ]
      : [],
  }
}

function pin(at: NodeSegment): GenePin {
  return {
    gene: {
      name: 'hemA',
      refName: 'chr1',
      start: 0,
      end: 1200,
      strand: 1,
      exons: [],
    },
    exons: '',
    at,
    covered: 1,
  }
}

function source(overrides: Partial<LabelLayoutSource>): LabelLayoutSource {
  return {
    paneWidth: 800,
    canvasHeight: 400,
    axisScale: { scaleX: 1, scaleY: 1 },
    translateX: 0,
    translateY: 0,
    contigThickness: 6,
    legendSize: { width: 0, height: 0 },
    drawnRowLabels: [],
    bubbleHalos: [],
    bubbleGlyphs: [],
    genePins: [],
    nodeLengths: new Map(),
    showDeletionEdges: false,
    deletions: [],
    alleleDeletions: [],
    positionsVersion: 0,
    ...overrides,
  }
}

// `pangenome/pggb_bubble_tier` drew "1.1 kb sub, partial" over the backbone
// length beside it, because the two overlays placed their labels apart.
test('a node length gives way to the bubble label over it', () => {
  const layout = layoutLabels(
    source({
      bubbleHalos: [halo({ x: 300, y: 216 })],
      nodePositions: {
        s1: [
          { x: 200, y: 200 },
          { x: 400, y: 200 },
        ],
      },
      nodeLengths: new Map([['s1', 700]]),
    }),
  )
  expect(layout.bubbles.map(l => l.text)).toEqual(['1.6 kb sub'])
  expect(layout.sizes).toEqual([])
})

test('a node length clear of every chip keeps its label', () => {
  const layout = layoutLabels(
    source({
      bubbleHalos: [halo({ x: 300, y: 100 })],
      nodePositions: {
        s1: [
          { x: 200, y: 300 },
          { x: 400, y: 300 },
        ],
      },
      nodeLengths: new Map([['s1', 700]]),
    }),
  )
  expect(layout.sizes.map(l => l.text)).toEqual(['700 bp'])
})

test('a row label holds its space against a gene pin', () => {
  const at = { x: 20, y: 200 }
  const without = layoutLabels(source({ genePins: [pin(at)] }))
  expect(without.genes.map(l => l.text)).toEqual(['hemA'])
  const pinY = without.genes[0]!.y
  const layout = layoutLabels(
    source({
      genePins: [pin(at)],
      drawnRowLabels: [{ label: 'Rank 1', y: pinY - 4 }],
    }),
  )
  expect(layout.genes).toEqual([])
})

test('a gene name outranks a route chip on the same spot', () => {
  const at = { x: 300, y: 200 }
  const without = layoutLabels(source({ genePins: [pin(at)] }))
  const pinY = without.genes[0]!.y
  const layout = layoutLabels(
    source({
      genePins: [pin(at)],
      bubbleHalos: [halo({ x: 300, y: 20 }, { x: 300, y: pinY - 4 })],
    }),
  )
  expect(layout.genes.map(l => l.text)).toEqual(['hemA'])
  expect(layout.routes.map(l => l.y)).not.toContain(pinY)
})

// pggb's partial bubbles name only their allele, which an anchored layout
// draws a row below the reference.
test('on a row layout a bubble name goes above the top row', () => {
  const allele = { x: 300, y: 120 }
  const free = layoutLabels(source({ bubbleHalos: [halo(allele)] }))
  const rows = layoutLabels(
    source({
      bubbleHalos: [halo(allele)],
      drawnRowLabels: [
        { label: 'Reference (rank 0)', y: 100 },
        { label: 'Rank 1', y: 120 },
      ],
    }),
  )
  expect(rows.bubbles[0]!.y).toBe(free.bubbles[0]!.y - 20)
})

// A sample-row layout overflows downward, and scrolling it takes the top row
// off the pane; the band sticks to the top edge rather than following it out.
test('a scrolled row layout keeps its bubble names at the top edge', () => {
  const rows = Array.from({ length: 40 }, (_, i) => ({
    label: `row ${i}`,
    y: i * 20,
  }))
  const layout = layoutLabels(
    source({
      bubbleHalos: [halo({ x: 300, y: 400 })],
      drawnRowLabels: rows,
      translateY: -300,
    }),
  )
  expect(layout.bubbles.map(l => l.y)).toEqual([15])
})

test('the legend holds its own box, and no box when none is drawn', () => {
  const corner = {
    nodePositions: {
      s1: [
        { x: 700, y: 20 },
        { x: 790, y: 20 },
      ],
    },
    nodeLengths: new Map([['s1', 700]]),
  }
  expect(layoutLabels(source(corner)).sizes.map(l => l.text)).toEqual([
    '700 bp',
  ])
  expect(
    layoutLabels(source({ ...corner, legendSize: { width: 170, height: 40 } }))
      .sizes,
  ).toEqual([])
})

test('the variant map stacks its names in rows clear of the legend', () => {
  const glyph = (start: number, label: string) => ({
    bubble: { ...bubble, start, end: start + 100 },
    kind: 'substitution' as const,
    label,
  })
  const layout = layoutLabels(
    source({
      translateY: 300,
      legendSize: { width: 170, height: 40 },
      bubbleGlyphs: [
        glyph(300, 'first substitution'),
        glyph(310, 'second substitution'),
        glyph(700, 'under the legend'),
      ],
    }),
  )
  expect(layout.glyphs.map(l => [l.text, l.y])).toEqual([
    ['first substitution', 15],
    ['second substitution', 34],
    ['under the legend', 72],
  ])
})
