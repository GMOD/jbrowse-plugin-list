import { deletionEdges } from '@jbrowse/bandage-core/deletionEdges'
import { loadGraph } from '@jbrowse/bandage-core/pipeline'
import { render, screen } from '@testing-library/react'

import HoverTooltip from './HoverTooltip'

import type { GraphPaneModel } from '../model'
import type { GenePin } from '@jbrowse/bandage-core/genes/genePins'

function shown(state: Record<string, unknown>) {
  const model = {
    hoveredNode: null,
    hoveredEdge: null,
    hoveredWalkRowText: undefined,
    hoveredTubeText: undefined,
    tooltipRightPx: 8,
    deletions: [],
    genePins: [],
    ...state,
  } as unknown as GraphPaneModel
  render(<HoverTooltip model={model} chip={undefined} />)
  return screen.queryAllByText(/—/).map(el => el.textContent)
}

test('a point on both a tube and a walk row reads out one of them', () => {
  expect(
    shown({
      hoveredTubeText: { label: 'HG002#1', readout: 'node 12' },
      hoveredWalkRowText: { label: 'HG002#2', readout: '3 copies' },
    }),
  ).toEqual(['HG002#2 — 3 copies'])
})

test('a node outranks the walk row under it', () => {
  const node = { id: '7', name: 's7', length: 1200, depth: 2 }
  expect(
    shown({
      hoveredNode: '7',
      hoverNodeById: new Map([['7', node]]),
      hoveredWalkRowText: { label: 'HG002#2', readout: '3 copies' },
    }),
  ).toEqual(['s7 — 1,200 bp, depth 2.0'])
})

const region = {
  assemblyName: 'GRCh38',
  refName: 'chr6',
  start: 0,
  end: 10_000,
}

test('a node off the reference also says where it sits on the reference', () => {
  const node = {
    id: '7',
    name: 's7',
    length: 1200,
    depth: 1,
    stable: { refName: 'HG002#1#h1tg01', start: 500, rank: 1 },
  }
  expect(
    shown({
      hoveredNode: '7',
      hoverNodeById: new Map([['7', node]]),
      graphRegion: region,
      hoveredSpan: { start: 1000, end: 2000 },
    }),
  ).toEqual([
    's7 — 1,200 bp, depth 1.0HG002 h1tg01:501-1,700 (rank 1)Reference GRCh38 chr6:1,001-2,000',
  ])
})

test('a backbone node reads its own location only', () => {
  const node = {
    id: '7',
    name: 's7',
    length: 1000,
    depth: 1,
    stable: { refName: 'GRCh38#0#chr6', start: 1000, rank: 0 },
  }
  expect(
    shown({
      hoveredNode: '7',
      hoverNodeById: new Map([['7', node]]),
      graphRegion: region,
      hoveredSpan: { start: 1000, end: 2000 },
    }),
  ).toEqual(['s7 — 1,000 bp, depth 1.0GRCh38 chr6:1,001-2,000 (rank 0)'])
})

const pinOver = (
  name: string,
  refName: string,
  onReference: boolean,
): GenePin => ({
  gene: { name, refName, start: 0, end: 100, strand: 1, exons: [] },
  exons: '',
  exonsByNode: [],
  nodeIds: new Set(['7']),
  at: { x: 0, y: 0 },
  covered: 1,
  anchored: 1,
  body: [],
  onReference,
  walks: 1,
})

test('a node and a folded node both list the genes over them, a copy off the reference with its haplotype', () => {
  const tipOf = (node: Record<string, unknown>) => {
    const model = {
      hoveredNode: '7',
      hoveredEdge: null,
      hoveredWalkRowText: undefined,
      hoveredTubeText: undefined,
      tooltipRightPx: 8,
      deletions: [],
      hoverNodeById: new Map([['7', node]]),
      genePins: [
        pinOver('CFH', 'GRCh38#0#chr1', true),
        pinOver('ENSG00000289697', 'HG00097#1#CM1', false),
      ],
    } as unknown as GraphPaneModel
    const { container, unmount } = render(
      <HoverTooltip model={model} chip={undefined} />,
    )
    const text = container.textContent
    unmount()
    return text
  }
  const node = { id: '7', name: 's7', length: 1200, depth: 2 }
  const genes = 'CFH, ENSG00000289697 · HG00097#1'
  expect(tipOf(node)).toContain(genes)
  const folded = tipOf({
    ...node,
    placeholder: true,
    stable: { refName: 'HG00097#1#CM1', start: 500, rank: 1 },
  })
  expect(folded).toContain('nodes not shown')
  expect(folded).toContain(genes)
})

// HG002 takes the 1 to 3 link past node 2, 50 bp of GRCh38 chr1
const SKIP_GFA = [
  'H\tVN:Z:1.1',
  `S\t1\t${'A'.repeat(100)}`,
  `S\t2\t${'C'.repeat(50)}`,
  `S\t3\t${'G'.repeat(100)}`,
  'L\t1\t+\t2\t+\t0M',
  'L\t2\t+\t3\t+\t0M',
  'L\t1\t+\t3\t+\t0M',
  'W\tGRCh38\t0\tchr1\t0\t250\t>1>2>3',
  'W\tHG002\t1\tchr1\t0\t200\t>1>3',
].join('\n')

test('a link skipping reference sequence says the bp it skips of the named reference, and names no event', () => {
  const graph = loadGraph(SKIP_GFA, 'skip', { referencePath: 'GRCh38#0#chr1' })
  const deletions = deletionEdges(graph)
  const hoveredEdge = deletions[0]!.edgeIndex
  render(
    <HoverTooltip
      model={
        {
          hoveredNode: null,
          hoveredEdge,
          hoveredWalkRowText: undefined,
          hoveredTubeText: undefined,
          tooltipRightPx: 8,
          graph,
          deletions,
        } as unknown as GraphPaneModel
      }
      chip={undefined}
    />,
  )
  expect(screen.getByText(/^skips/).textContent).toBe(
    'skips 50 bp of GRCh38 chr1 sequenceGRCh38#0#chr1:101-150',
  )
  expect(screen.queryByText(/Deletion/)).toBeNull()
})
