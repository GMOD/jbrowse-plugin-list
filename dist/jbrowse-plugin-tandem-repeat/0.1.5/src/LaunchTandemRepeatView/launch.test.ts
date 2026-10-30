import { launch } from './index'

import type { DisplayModel } from './index'
import type { Feature } from '@jbrowse/core/util'

const session = {
  rpcManager: { call: vi.fn() },
  addView: vi.fn(),
  notify: vi.fn(),
  notifyError: vi.fn(),
}

vi.mock('@jbrowse/core/util', async importOriginal => ({
  ...(await importOriginal()),
  getSession: () => session,
  getContainingTrack: () => ({}),
  getRpcSessionId: () => 'rpc',
}))

vi.mock('@jbrowse/core/configuration', async importOriginal => ({
  ...(await importOriginal()),
  getConf: (_: unknown, name: string) =>
    name === 'adapter' ? { type: 'VcfTabixAdapter' } : undefined,
}))

const record = {
  get: (name: string) =>
    ({
      refName: 'chr6',
      start: 100,
      end: 101,
      ALT: ['<CNV:TR>'],
      INFO: { SVLEN: [30], RN: [1], RUL: [10], RUC: [3] },
      samples: { HG00097: { GT: ['1|0'] } },
    })[name],
} as Feature

const display = (sources?: unknown) =>
  ({ contextMenuItems: () => [], sources }) as unknown as DisplayModel

const opened = () =>
  session.addView.mock.calls[0]![1] as { samples?: unknown; repeat: unknown }

beforeEach(() => {
  vi.clearAllMocks()
})

test("the multi-sample display's loaded sources give the samples, one row each", async () => {
  await launch(
    display([
      {
        name: 'HG00097 HP0',
        sampleName: 'HG00097',
        HP: 0,
        color: 'red',
        superpopulation: 'EUR',
      },
      { name: 'HG00097 HP1', sampleName: 'HG00097', HP: 1 },
    ]),
    () => Promise.resolve(record),
  )
  expect(session.rpcManager.call).not.toHaveBeenCalled()
  expect(opened().samples).toEqual([
    { name: 'HG00097', superpopulation: 'EUR' },
  ])
})

test('a display without sources asks the RPC with the track adapter', async () => {
  session.rpcManager.call.mockResolvedValue({
    sources: [{ name: 'HG00097', population: 'GBR' }],
    warnings: [],
  })
  await launch(display(), () => Promise.resolve(record))
  expect(session.rpcManager.call).toHaveBeenCalledWith(
    'rpc',
    'MultiSampleVariantGetSources',
    { adapterConfig: { type: 'VcfTabixAdapter' } },
  )
  expect(opened().samples).toEqual([{ name: 'HG00097', population: 'GBR' }])
})

test('sources naming no column beyond the sample store no samples', async () => {
  session.rpcManager.call.mockResolvedValue({ sources: [{ name: 'HG00097' }] })
  await launch(display([]), () => Promise.resolve(record))
  expect(opened()).not.toHaveProperty('samples')
})

test('a failed metadata read still opens the view, and says so', async () => {
  session.rpcManager.call.mockRejectedValue(new Error('no such RPC'))
  await launch(display(), () => Promise.resolve(record))
  expect(opened().repeat).toBeDefined()
  expect(opened()).not.toHaveProperty('samples')
  expect(session.notify).toHaveBeenCalledWith(
    expect.stringContaining('no such RPC'),
    'warning',
  )
  expect(session.notifyError).not.toHaveBeenCalled()
})
