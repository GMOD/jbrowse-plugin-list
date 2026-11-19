import { layoutEngine } from '@jbrowse/bandage-core/layoutEngines'
import { reaction } from 'mobx'

import { mockRpcCall } from './modelTestMocks'
import { attachedModel, fakeRenderer } from './modelTestSupport'
import { VIEWPORT_DEBOUNCE_MS } from './pane/paneBase'

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

const later = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const BUBBLE = [
  'S\tr1\t*\tLN:i:5000',
  'S\tr2\t*\tLN:i:5000',
  'S\talt\t*\tLN:i:400',
  'L\tr1\t+\tr2\t+\t0M',
  'L\tr1\t+\talt\t+\t0M',
  'L\talt\t+\tr2\t+\t0M',
  'W\tGRCh38\t0\tchr1\t0\t10000\t>r1>r2',
  'W\tA\t1\tctg\t0\t10400\t>r1>alt>r2',
  '',
].join('\n')

beforeEach(() => {
  mockRpcCall.mockImplementation(
    (_session: unknown, method: string, request: EngineRequest) =>
      method === 'GraphComputeLayout'
        ? layoutEngine(request)
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
})

async function splitByWalk(model: ReturnType<typeof attachedModel>) {
  await model.loadGFA(BUBBLE, 'bubble')
  model.liftWalks(['GRCh38#0#chr1', 'A#1#ctg'])
  model.setFacet('walk')
  const stop = reaction(
    () => model.facetDrawings,
    () => {},
    { fireImmediately: true },
  )
  const early = model.facetDrawings
  expect(early).toHaveLength(2)
  return { early, stop }
}

function fit(model: ReturnType<typeof attachedModel>) {
  model.setWidth(1200)
  model.setLegendSize({ width: 150, height: 60 })
}

function expectBuiltFor(
  model: ReturnType<typeof attachedModel>,
  drawings: typeof model.facetDrawings,
) {
  const panels = (drawings ?? []).flatMap(panel => panel ?? [])
  expect(panels.map(p => p.view.axis)).toEqual([
    model.axisScale,
    model.axisScale,
  ])
  expect(panels.map(p => p.batch.nodeStrokes.length > 0)).toEqual([true, true])
}

// The key reads the panels' drawings as soon as the layout lands, before the
// pane is sized and fitted, as a restored session's does
test('a panel drawing built before the fit is built again for the fitted view', async () => {
  const model = attachedModel()
  model.startRenderingBackend(fakeRenderer())
  const { early, stop } = await splitByWalk(model)
  fit(model)
  await later(VIEWPORT_DEBOUNCE_MS + 100)
  const rebuilt = model.facetDrawings
  stop()
  expect(rebuilt).not.toBe(early)
  expectBuiltFor(model, rebuilt)
})

// A track's pane takes its view before its canvas mounts, so the renderer
// starts on a view the panels were never built for
test('a panel drawing built before a view the renderer never saw is built again', async () => {
  const model = attachedModel()
  const { early, stop } = await splitByWalk(model)
  fit(model)
  model.zoomToFit()
  expect(model.scale).not.toBe(1)
  model.startRenderingBackend(fakeRenderer())
  await later(VIEWPORT_DEBOUNCE_MS + 100)
  const rebuilt = model.facetDrawings
  stop()
  expect(rebuilt).not.toBe(early)
  expectBuiltFor(model, rebuilt)
})
