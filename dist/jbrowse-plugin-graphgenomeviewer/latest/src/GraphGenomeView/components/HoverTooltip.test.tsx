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

// SV-rep-1k-10k: HG01109's 2 bp in place of 1,839 bp of GRCh38, whose
// routed feet draw in a skip's ink, hovered as "Edge: r1 → x"
test("a padded foot a force layout routed says what its walk's run skips", () => {
  const graph = loadGraph(
    [
      `S\tr1\t${'A'.repeat(2000)}`,
      `S\tr2\t${'C'.repeat(1839)}`,
      `S\tr3\t${'G'.repeat(2000)}`,
      'S\tx\tTT',
      'L\tr1\t+\tr2\t+\t0M',
      'L\tr2\t+\tr3\t+\t0M',
      'L\tr1\t+\tx\t+\t0M',
      'L\tx\t+\tr3\t+\t0M',
      'W\tGRCh38\t0\tchr5\t0\t5839\t>r1>r2>r3',
      'W\tHG01109\t1\tc\t0\t4002\t>r1>x>r3',
    ].join('\n'),
    'replacement',
    { referencePath: 'GRCh38#0#chr5' },
  )
  const id = (name: string) => graph.nodes.find(n => n.name === name)!.id
  const hoveredEdge = graph.edges.findIndex(
    e => e.from === id('r1') && e.to === id('x'),
  )
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
          deletions: deletionEdges(graph),
          deletionRoutes: { [hoveredEdge]: [{ x: 0, y: 0 }] },
        } as unknown as GraphPaneModel
      }
      chip={undefined}
    />,
  )
  expect(screen.queryByText(/skips/)?.textContent).toBe(
    'skips 1,839 bp of GRCh38 chr5 sequenceGRCh38#0#chr5:2,001-3,839',
  )
})

// walks >r1>x>r3 and >r1>x>y>r4 share r1→x but skip different stretches
test('a padded foot whose walks skip different stretches says only that it skips reference sequence', () => {
  const graph = loadGraph(
    [
      `S\tr1\t${'A'.repeat(2000)}`,
      `S\tr2\t${'C'.repeat(1839)}`,
      `S\tr3\t${'G'.repeat(2000)}`,
      `S\tr4\t${'G'.repeat(2000)}`,
      'S\tx\tTT',
      `S\ty\t${'T'.repeat(500)}`,
      'L\tr1\t+\tr2\t+\t0M',
      'L\tr2\t+\tr3\t+\t0M',
      'L\tr3\t+\tr4\t+\t0M',
      'L\tr1\t+\tx\t+\t0M',
      'L\tx\t+\tr3\t+\t0M',
      'L\tx\t+\ty\t+\t0M',
      'L\ty\t+\tr4\t+\t0M',
      'W\tGRCh38\t0\tchr5\t0\t7839\t>r1>r2>r3>r4',
      'W\tHG01109\t1\tc\t0\t6002\t>r1>x>r3>r4',
      'W\tHG002\t1\tc\t0\t4502\t>r1>x>y>r4',
    ].join('\n'),
    'replacements',
    { referencePath: 'GRCh38#0#chr5' },
  )
  const id = (name: string) => graph.nodes.find(n => n.name === name)!.id
  const hoveredEdge = graph.edges.findIndex(
    e => e.from === id('r1') && e.to === id('x'),
  )
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
          deletions: deletionEdges(graph),
          deletionRoutes: { [hoveredEdge]: [{ x: 0, y: 0 }] },
        } as unknown as GraphPaneModel
      }
      chip={undefined}
    />,
  )
  expect(screen.queryByText(/skips/)?.textContent).toBe(
    'skips GRCh38 chr5 sequence',
  )
})

// SV-inv-1k-10k: the heads along an inverted stretch name no walk, so the
// hover counts the walks reading the node against the reference
test('a reference node some walk reads against the reference says which walks do', () => {
  const graph = loadGraph(
    [
      'S\t1\tAAAAAAAAAA',
      'S\t2\tCCCCCCCCCC',
      'S\t3\tGGGGGGGGGG',
      'L\t1\t+\t2\t+\t0M',
      'L\t2\t+\t3\t+\t0M',
      'L\t1\t+\t2\t-\t0M',
      'L\t2\t-\t3\t+\t0M',
      'W\tGRCh38\t0\tchr6\t0\t30\t>1>2>3',
      'W\tinv\t1\tc\t0\t30\t>1<2>3',
    ].join('\n'),
    'inversion',
  )
  const node = graph.nodes.find(n => n.name === '2')!
  render(
    <HoverTooltip
      model={
        {
          hoveredNode: node.id,
          hoverNodeById: new Map(graph.nodes.map(n => [n.id, n])),
          hoveredEdge: null,
          tooltipRightPx: 8,
          deletions: [],
          genePins: [],
          drawnGraph: graph,
          graphRegion: region,
        } as unknown as GraphPaneModel
      }
      chip={undefined}
    />,
  )
  expect(
    screen.getByText(/walked against .+'s direction by 1 haplotype: inv#1/),
  ).toBeTruthy()
})

// a reference node a fold holds counts the nodes folded into it, not the
// stretches a cut did not load that ride it
test('a folded node counts the nodes folded into it, leaving out stretches not loaded', () => {
  const node = {
    id: 'a~c+',
    name: 'a~c',
    length: 2000,
    depth: 2,
    members: ['a', 'b', 'c', 'q', 'HG2#1#c:10-110'],
    stable: { refName: 'chr', start: 0, rank: 0 },
  }
  const model = {
    hoveredNode: node.id,
    hoverNodeById: new Map([[node.id, node]]),
    hoveredEdge: null,
    hoveredWalkRowText: undefined,
    hoveredTubeText: undefined,
    tooltipRightPx: 8,
    deletions: [],
    genePins: [],
    graph: {
      name: 'fold',
      nodes: [node],
      edges: [],
      paths: [],
      threadFold: { belowBp: 500, haplotypes: 2, walks: 2, stepless: 0 },
    },
    notLoadedNames: new Set(['HG2#1#c:10-110']),
    walkLabel: (name: string) => name,
  } as unknown as GraphPaneModel
  const { container } = render(<HoverTooltip model={model} chip={undefined} />)
  expect(container.textContent).toContain('4 nodes folded into it')
})

test("a folded node's hover gives a lone haplotype's thread its count, so it does not read as one of a wider thread's haplotypes", () => {
  const node = { id: 'a+', name: 'a', length: 2000, depth: 5 }
  const model = {
    hoveredNode: node.id,
    hoverNodeById: new Map([[node.id, node]]),
    hoveredEdge: null,
    hoveredWalkRowText: undefined,
    hoveredTubeText: undefined,
    tooltipRightPx: 8,
    deletions: [],
    genePins: [],
    graph: {
      name: 'fold',
      nodes: [node],
      edges: [],
      paths: [
        {
          name: 'HG002#1#c',
          nodeIds: ['a+'],
          count: 4,
          members: ['HG002#1#c', 'HG002#2#c', 'HG005#1#c', 'HG005#2#c'],
          variation: '4 haplotypes on 2 distinct walks, 1 bp folded away',
        },
        {
          name: 'HG00097#1#c',
          nodeIds: ['a+'],
          count: 1,
          members: ['HG00097#1#c'],
        },
      ],
      threadFold: { belowBp: 500, haplotypes: 5, walks: 5, stepless: 0 },
    },
    notLoadedNames: new Set(),
    walkLabel: (name: string) => name.split('#').slice(0, 2).join('#'),
  } as unknown as GraphPaneModel
  const { container } = render(<HoverTooltip model={model} chip={undefined} />)
  expect(container.innerHTML).toContain(
    '4 haplotypes on 2 distinct walks, 1 bp folded away</span>',
  )
  expect(container.innerHTML).toContain('<br>1 haplotype: HG00097#1</span>')
})
