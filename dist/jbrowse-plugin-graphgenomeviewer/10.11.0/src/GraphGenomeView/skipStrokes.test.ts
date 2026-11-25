import { readFileSync } from 'node:fs'

import { layoutEngine } from '@jbrowse/bandage-core/layoutEngines'
import { SMALL_SITE_PX } from '@jbrowse/bandage-core/levelOfDetail'
import { EDGE_DEFAULT_COLOR } from '@jbrowse/bandage-core/renderer/GeometryBuilder'

import { mockRpcCall } from './modelTestMocks'
import { createAnchoredModel, createModel } from './modelTestSupport'

import type { EngineRequest } from '@jbrowse/bandage-core/pipeline'

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

// a skip takes its head where its span on screen would hold three 11 px
// dashes
const THREE_DASHES_PX = 33

const layouts = [
  {
    layout: 'the stress engine',
    create: () => {
      const model = createModel()
      model.setLayoutEngine('stress')
      return model
    },
  },
  {
    layout: 'the reference-anchored layout',
    create: createAnchoredModel,
  },
]

// At chr1:27,853,000-27,855,000 HG02055's 50 bp skip and the 1 and 2 bp
// skips drew as solid black darts on the backbone, and a skip too short to
// dash was one plain stroke keyed apart. A skip whose bp come to under
// SMALL_SITE_PX at the reference's px a bp is not drawn, and the fold says
// so, unless small sites are shown; one whose span on screen holds no arch
// its stroke can shape is the plain link it is, headless; any other is one
// solid arch in link ink, headless where its span holds fewer than three
// dashes. The owner found dashes over a short span ugly.
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
  const wrong: string[] = []
  const plain: string[] = []
  const arched: string[] = []
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
      const span = strokes[0]?.span ?? 0
      const fold = batch.collapsed
      const small = !smallSites && bp * (fold?.pxPerBp ?? 0) < SMALL_SITE_PX
      const seen = `${bp} bp at ${scale}`
      const drawn = `${seen}: ${strokes.length} strokes, ${heads} heads, ${span.toFixed(1)} px across, ${fold?.edges.has(edgeIndex) ? '' : 'not '}folded`
      if (small !== !!fold?.edges.has(edgeIndex) || small !== !strokes.length) {
        wrong.push(drawn)
      } else if (small) {
        folded.push(seen)
      } else if (!strokes[0]!.skip) {
        plain.push(seen)
        if (heads > 0) {
          wrong.push(drawn)
        }
      } else {
        arched.push(seen)
        if (
          strokes.length !== 1 ||
          !strokes[0]!.arch ||
          strokes[0]!.dashed ||
          strokes[0]!.color !== EDGE_DEFAULT_COLOR ||
          (heads > 0 && span < THREE_DASHES_PX - 1)
        ) {
          wrong.push(drawn)
        }
      }
    }
  }
  return { wrong, plain, arched, folded }
}

test.each(layouts)(
  'at the 571 bp gap under $layout, a skip is one solid arch in link ink wherever its span holds an arch, headless under three dashes long, a plain link where it holds none, and folded while its bp come under the small-site line',
  async ({ create }) => {
    const { wrong, arched, folded } = await skipStrokes(create, false)
    expect(wrong).toEqual([])
    expect(arched).toEqual(
      expect.arrayContaining(['50 bp at 3', '571 bp at 0.25']),
    )
    expect(folded).toEqual(expect.arrayContaining(['1 bp at 0.1']))
  },
)

test.each(layouts)(
  'at the 571 bp gap under $layout with small sites shown, no skip folds, and each is one solid arch wherever its span holds an arch and a plain link where it holds none',
  async ({ create }) => {
    const { wrong, arched, folded } = await skipStrokes(create, true)
    expect(wrong).toEqual([])
    expect(folded).toEqual([])
    expect(arched).toEqual(
      expect.arrayContaining(['50 bp at 3', '571 bp at 0.25', '1 bp at 6']),
    )
  },
)
