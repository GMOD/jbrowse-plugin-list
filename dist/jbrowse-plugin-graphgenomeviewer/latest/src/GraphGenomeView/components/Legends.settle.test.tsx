import { readConfObject } from '@jbrowse/core/configuration'
import { render, waitFor } from '@testing-library/react'

import { Legends } from './GraphCanvas'
import { legendSections } from '../legendSections'
import { mockRpcCall, mockSession } from '../modelTestMocks'
import { fakeRenderer } from '../modelTestSupport'
import stateModelFactory from '../viewModel'

vi.mock('@jbrowse/core/util', async () =>
  (await import('../modelTestMocks')).coreUtilMock(),
)
vi.mock(import('@jbrowse/core/configuration'), async importOriginal =>
  (await import('../modelTestMocks')).configurationMock(await importOriginal()),
)
vi.mock('@jbrowse/core/util/io', async () =>
  (await import('../modelTestMocks')).ioMock(),
)

// GRCh38 walks r1 r2 r3 over chr1:1000-1030 and a haplotype walks r1, a node
// of its own and r3, from 5000 on its contig CM1
const GFA = [
  'S\tr1\tAAAAAAAAAA',
  'S\tr2\tCCCCCCCCCC',
  'S\tr3\tGGGGGGGGGG',
  'S\th0\tTTTTTTTTTT',
  'L\tr1\t+\tr2\t+\t0M',
  'L\tr2\t+\tr3\t+\t0M',
  'L\tr1\t+\th0\t+\t0M',
  'L\th0\t+\tr3\t+\t0M',
  'W\tGRCh38\t0\tchr1\t1000\t1030\t>r1>r2>r3',
  'W\tHG00097\t1\tCM1\t5000\t5030\t>r1>h0>r3',
  '',
].join('\n')

const gene = (name: string, refName: string, start: number, end: number) => ({
  type: 'gene',
  name,
  refName,
  start,
  end,
  strand: 1,
  subfeatures: [{ type: 'exon', start, end }],
})

const bySlot = (obj: Record<string, unknown>, key?: unknown) => obj[String(key)]
const adapterOnly = (obj: Record<string, unknown>, key?: unknown) =>
  key === 'adapter' ? obj.adapter : undefined

beforeEach(() => {
  vi.mocked(readConfObject).mockImplementation(bySlot)
  mockSession.assemblyNames = ['hg38', 'HG00097']
  mockSession.tracks = [
    { trackId: 'graph', assemblyNames: [], adapter: {} },
    {
      trackId: 'refseq',
      name: 'RefSeq genes',
      assemblyNames: ['hg38'],
      adapter: { type: 'Gff3TabixAdapter', which: 'hg38' },
    },
    {
      trackId: 'HG00097_genes',
      name: 'HG00097 genes',
      assemblyNames: ['HG00097'],
      adapter: { type: 'Gff3TabixAdapter', which: 'HG00097' },
    },
  ]
  mockRpcCall.mockReset()
  mockRpcCall.mockImplementation(
    (
      _sid: unknown,
      method: string,
      args: { adapterConfig?: { which?: string } },
    ) =>
      method === 'GetSubgraph'
        ? Promise.resolve(GFA)
        : method === 'CoreGetFeatures'
          ? Promise.resolve(
              args.adapterConfig?.which === 'hg38'
                ? [gene('CFH', 'chr1', 1005, 1025)]
                : [gene('CFHR3', 'CM1', 5011, 5019)],
            )
          : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
})

afterEach(() => {
  vi.mocked(readConfObject).mockImplementation(adapterOnly)
  mockSession.tracks = []
  mockSession.assemblyNames = []
})

// The page's key on the view's own model, unmocked: the labels wait for the
// key to say what it draws and to be measured as that, so a key that never
// says it, or measures without it, would leave the page with no label
test('the key says what it draws and is measured as that, and the labels are placed once it is', async () => {
  const model = stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode: 'auto',
    loadedTrackId: 'graph',
  })
  model.setWidth(1200)
  model.startRenderingBackend(fakeRenderer())
  render(<Legends model={model} />)
  await model.cutSubgraph(
    {},
    { refName: 'chr1', assemblyName: 'hg38', start: 1000, end: 1030 },
  )
  await waitFor(() => {
    expect(model.overlayLabels.genes.map(g => g.text).sort()).toEqual([
      'CFH',
      'CFHR3',
    ])
  })
  expect(model.keyShape).toBe(JSON.stringify(legendSections(model)))
  expect(model.measuredKeyShape).toBe(model.keyShape)
})
