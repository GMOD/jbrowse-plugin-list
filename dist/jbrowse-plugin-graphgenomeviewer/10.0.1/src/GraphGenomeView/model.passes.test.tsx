import { layoutEngine } from '@jbrowse/bandage-core/layoutEngines'
import { abgrHex } from '@jbrowse/bandage-core/renderer/colorBits'
import { render } from '@testing-library/react'

import PassBars from './components/PassBars'
import WalkStrip from './components/WalkStrip'
import { mockRpcCall } from './modelTestMocks'
import stateModelFactory from './viewModel'

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

// a repeat a, b, c, d the reference reads once and hap#1 three times
const GFA = [
  'S\tf1\tAAAAAAAAAA',
  'S\ta\tCCCC',
  'S\tb\tGGGG',
  'S\tc\tTTTT',
  'S\td\tAAAA',
  'S\tf2\tGGGGGGGGGG',
  'L\tf1\t+\ta\t+\t0M',
  'L\ta\t+\tb\t+\t0M',
  'L\tb\t+\tc\t+\t0M',
  'L\tc\t+\td\t+\t0M',
  'L\td\t+\ta\t+\t0M',
  'L\td\t+\tf2\t+\t0M',
  'W\tref\t0\tchr\t0\t26\t>f1>a>b>c>d>f2',
  'W\thap\t1\tctg\t0\t*\t>f1>a>b>c>d>a>b>c>d>a>b>c>d>f2',
  '',
].join('\n')

async function liftedByPass(walkStrip = false) {
  mockRpcCall.mockImplementation(
    (_session: unknown, method: string, request: EngineRequest) =>
      method === 'GraphComputeLayout'
        ? layoutEngine(request)
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
  const model = stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode: 'ordered',
    layers: { walkStrip },
  })
  model.setWidth(1200)
  await model.loadGFA(GFA, 'repeat')
  model.setLegendSize({ width: 150, height: 60 })
  model.setWalkLayers([
    { walk: 'ref#0#chr' },
    { walk: 'hap#1#ctg', color: { field: 'pass' } },
  ])
  model.zoomToFit()
  const { batch, viewportBounds } = model.buildDrawing(model.walkLift, false)!
  model.setGeometryMetrics(0, batch, {
    scale: model.scale,
    bounds: viewportBounds,
  })
  return model
}

test('each pass of a walk lifted by pass is named once on the graph, beside a thread of its own', async () => {
  const model = await liftedByPass()
  const placed = model.overlayLabels.passes
  expect(placed.map(p => p.text).sort()).toEqual(['pass 1', 'pass 2', 'pass 3'])
  for (const { item } of placed) {
    expect(item.walk).toBe('hap#1#ctg')
    expect(item.at.x).toBeGreaterThanOrEqual(0)
    expect(item.at.x).toBeLessThanOrEqual(model.paneWidth)
  }
  model.setWalkLayers([{ walk: 'ref#0#chr' }, { walk: 'hap#1#ctg' }])
  expect(model.overlayLabels.passes).toEqual([])
})

test('a view of its own draws a bar along each walk lifted by pass, colouring the stretches each pass steps again', async () => {
  const model = await liftedByPass()
  const [bar, ...more] = model.passBars
  expect(more).toEqual([])
  expect(bar!.walk).toBe('hap#1#ctg')
  expect(bar!.passes.map(p => [p.text, p.start, p.end])).toEqual([
    ['pass 1 · 16 bp', 10, 26],
    ['pass 2 · 16 bp', 26, 42],
    ['pass 3 · 16 bp', 42, 58],
  ])
  const { getAllByTestId } = render(<PassBars model={model} />)
  const [drawn] = getAllByTestId('graph-pass-bar')
  expect(drawn!.textContent).toContain('along its length')
  for (const name of ['pass 1 · 16 bp', 'pass 2 · 16 bp', 'pass 3 · 16 bp']) {
    expect(drawn!.textContent).toContain(name)
  }
  model.setWalkLayers([{ walk: 'ref#0#chr' }, { walk: 'hap#1#ctg' }])
  expect(model.passBars).toEqual([])
})

test("the strip paints a walk lifted by pass in its passes' colours, and its pass bar goes while the strip draws its row", async () => {
  const model = await liftedByPass(true)
  const drawn = model.walkLift!.walks.find(w => w.name === 'hap#1#ctg')!
  const passColors = drawn.walkPasses!.passes.map(pass => abgrHex(pass.ink))
  expect(passColors).toHaveLength(3)
  const { getByTestId } = render(<WalkStrip model={model} />)
  const hapRow = [
    ...getByTestId('graph-walk-strip').querySelectorAll(
      '[data-testid="graph-walk-row"]',
    ),
  ].find(row => row.querySelector('linearGradient'))!
  const stops = [...hapRow.querySelectorAll('stop')].map(stop =>
    stop.getAttribute('stop-color'),
  )
  expect(stops).toEqual(expect.arrayContaining(passColors))
  expect(model.passBars).toEqual([])
  model.setWalkRowSamples(['ref'])
  expect(model.walkStripRows!.rows).toEqual([])
  expect(model.passBars.map(bar => bar.walk)).toEqual(['hap#1#ctg'])
})
