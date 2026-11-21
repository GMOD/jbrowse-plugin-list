import { readFileSync } from 'node:fs'

import { layoutEngine } from '@jbrowse/bandage-core/layoutEngines'
import { SMALL_SITE_PX } from '@jbrowse/bandage-core/levelOfDetail'
import { layoutGeometryInputs } from '@jbrowse/bandage-core/renderer/geometryInputs'
import { baseEdgeCurves } from '@jbrowse/bandage-core/util/edgeCurves'
import { curvePointAt } from '@jbrowse/bandage-core/util/geometry'

import { mockRpcCall } from './modelTestMocks'
import { createAnchoredModel, createModel } from './modelTestSupport'

import type { DeletionEdge } from '@jbrowse/bandage-core/deletionEdges'
import type { EngineRequest } from '@jbrowse/bandage-core/pipeline'
import type { NodeSegment } from '@jbrowse/bandage-core/types'
import type { BezierCurve } from '@jbrowse/bandage-core/util/geometry'

vi.mock('@jbrowse/core/util', async () =>
  (await import('./modelTestMocks')).coreUtilMock(),
)
vi.mock(import('@jbrowse/core/configuration'), async importOriginal =>
  (await import('./modelTestMocks')).configurationMock(await importOriginal()),
)
vi.mock('@jbrowse/core/util/io', async () =>
  (await import('./modelTestMocks')).ioMock(),
)

const GAP571 = readFileSync(
  require.resolve('../../test_data/hprc2/hprc_gap571.gfa'),
  'utf8',
)

// a dashed skip holds a dash, a gap and a dash at the fewest, each 11 px
const THREE_DASHES_PX = 33

// Where each layout draws the 1 and 2 bp skips under the line, and the
// next scale up, where it draws them again. The stress engine runs each skip
// along a route of its own, 15.6 px for the 1 bp skip at scale 0.1, so none
// is under the line at these scales. The anchored layout draws the skipped
// node at its bp and lays the skip flat over it until it bows: the 1 bp skip
// is 1.5 px at 0.75 and 14.9 at 1, the 2 bp skip 1 px at 0.25 and 28.3 at 0.5.
const layouts = [
  {
    layout: 'the stress engine',
    create: () => {
      const model = createModel()
      model.setLayoutEngine('stress')
      return model
    },
    under: [],
    over: ['1 bp at 0.1', '2 bp at 0.1'],
  },
  {
    layout: 'the reference-anchored layout',
    create: createAnchoredModel,
    under: ['1 bp at 0.75', '2 bp at 0.25'],
    over: ['1 bp at 1', '2 bp at 0.5'],
  },
]

type Model = ReturnType<typeof createModel>

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)

// how long a line or a link is drawn on screen, the links sampled as the
// fold samples them
function linePx(model: Model, line: readonly NodeSegment[] = []) {
  return sum(
    line
      .slice(1)
      .map((b, i) =>
        Math.hypot(
          (b.x - line[i]!.x) * model.scaleX,
          (b.y - line[i]!.y) * model.scaleY,
        ),
      ),
  )
}

function curvesPx(model: Model, curves: readonly BezierCurve[] = []) {
  return sum(
    curves.map(c =>
      linePx(
        model,
        Array.from({ length: 9 }, (_, k) => curvePointAt(c, k / 8)),
      ),
    ),
  )
}

// A skip as drawn: its own link, and the reference it skips as the drawing
// has it, the skipped nodes and the reference's own links from where the
// skip leaves to where it lands
function drawnSkipPx(model: Model, skip: DeletionEdge) {
  const graph = model.graph!
  const inputs = layoutGeometryInputs(
    model.layoutResult!,
    model.deletionDrawing!,
  )
  const curves = baseEdgeCurves(
    inputs.nodePositions,
    graph,
    model.axisScale,
    inputs.deletions,
    model.positionsVersion,
    inputs.deletionRoutes,
    inputs.stranded,
  )
  const chain = [skip.from, ...skip.bypassed, skip.to]
  const links = chain
    .slice(1)
    .map((to, i) =>
      graph.edges.findIndex(
        e =>
          (e.from === chain[i] && e.to === to) ||
          (e.from === to && e.to === chain[i]),
      ),
    )
  return (
    curvesPx(model, curves.get(skip.edgeIndex)) +
    sum(skip.bypassed.map(id => linePx(model, model.nodePositions?.[id]))) +
    sum(links.map(edge => curvesPx(model, curves.get(edge))))
  )
}

// At chr1:27,853,000-27,855,000 HG02055's 50 bp skip and the 1 and 2 bp
// skips drew as solid black darts on the backbone: two or three dashes of a
// heavy stroke, a few px each, under a head. A skip drawn under
// SMALL_SITE_PX, its own link and the reference it skips as drawn, is not
// drawn at all, and the fold says so, unless small sites are shown.
async function skipStrokes(
  create: () => ReturnType<typeof createModel>,
  smallSites: boolean,
) {
  mockRpcCall.mockImplementation(
    (_session: unknown, method: string, request: EngineRequest) =>
      method === 'GraphComputeLayout'
        ? layoutEngine(request)
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
  const model = create()
  model.setLayer('smallSites', smallSites)
  model.setWidth(1600)
  await model.loadGFA(GAP571, 'gap571')
  expect(model.deletions.map(d => d.bp).sort((a, b) => a - b)).toEqual([
    1, 2, 50, 571,
  ])
  const plainHalfWidth = model.connectorThickness / 2
  const wrong: string[] = []
  const plain: string[] = []
  const dashed: string[] = []
  const folded: string[] = []
  for (const scale of [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 6]) {
    for (const skip of model.deletions) {
      const { edgeIndex, bp } = skip
      const { from } = model.graph!.edges[edgeIndex]!
      const at = model.nodePositions![from]!.at(-1)!
      model.setTransform(scale, 800 - at.x * scale, 200 - at.y * scale)
      const { batch } = model.buildDrawing(undefined, false)!
      const run = batch.edgeCurveRuns.get(edgeIndex)
      const strokes = run
        ? batch.edgeCurves.slice(run.start, run.start + run.count)
        : []
      const heads = batch.arrowRuns.get(edgeIndex)?.count ?? 0
      const first = strokes[0]?.curves[0]
      const last = strokes.at(-1)?.curves.at(-1)
      const a = first && model.toScreen(curvePointAt(first, 0))
      const b = last && model.toScreen(curvePointAt(last, 1))
      const spanPx = a && b ? Math.hypot(b.x - a.x, b.y - a.y) : 0
      const fold = batch.collapsed
      const sizePx = drawnSkipPx(model, skip)
      const small = !smallSites && sizePx < SMALL_SITE_PX
      const seen = `${bp} bp at ${scale}`
      const drawn = `${seen}: ${strokes.length} strokes, ${heads} heads, ${spanPx.toFixed(1)} px across, drawn ${sizePx.toFixed(1)} px, ${fold?.edges.has(edgeIndex) ? '' : 'not '}folded`
      if (small !== !!fold?.edges.has(edgeIndex) || small !== !strokes.length) {
        wrong.push(drawn)
      } else if (small) {
        folded.push(seen)
      } else if (strokes.length === 1) {
        plain.push(seen)
        if (
          heads > 0 ||
          strokes[0]!.thickness !== plainHalfWidth ||
          spanPx >= THREE_DASHES_PX + 1
        ) {
          wrong.push(drawn)
        }
      } else {
        dashed.push(seen)
        if (spanPx < THREE_DASHES_PX - 1) {
          wrong.push(drawn)
        }
      }
    }
  }
  return { wrong, plain, dashed, folded }
}

test.each(layouts)(
  'at the 571 bp gap under $layout, a skip is one plain stroke with no head until its span on screen holds three dashes, and is folded while it is drawn under the small-site line',
  async ({ create, under, over }) => {
    const { wrong, plain, dashed, folded } = await skipStrokes(create, false)
    expect(wrong).toEqual([])
    expect(plain).toEqual(expect.arrayContaining(['50 bp at 0.25', ...over]))
    expect(dashed).toEqual(
      expect.arrayContaining(['50 bp at 3', '571 bp at 0.25']),
    )
    expect(folded).toEqual(
      under.length > 0 ? expect.arrayContaining(under) : [],
    )
  },
)

test.each(layouts)(
  'at the 571 bp gap under $layout with small sites shown, every skip is drawn at every scale, plain until its span holds three dashes',
  async ({ create }) => {
    const { wrong, plain, dashed, folded } = await skipStrokes(create, true)
    expect(wrong).toEqual([])
    expect(folded).toEqual([])
    expect(plain).toEqual(
      expect.arrayContaining(['50 bp at 0.25', '1 bp at 1', '2 bp at 1']),
    )
    expect(dashed).toEqual(
      expect.arrayContaining(['50 bp at 3', '571 bp at 0.25']),
    )
  },
)
