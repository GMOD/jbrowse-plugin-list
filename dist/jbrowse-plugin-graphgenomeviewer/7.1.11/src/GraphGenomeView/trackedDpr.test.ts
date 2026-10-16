import { autorun } from 'mobx'

test('a resolution change re-runs what read the ratio, and re-arms for the next', async () => {
  const fire: (() => void)[] = []
  vi.stubGlobal('devicePixelRatio', 1)
  vi.stubGlobal('matchMedia', () => ({
    addEventListener: (_: string, listener: () => void) => {
      fire.push(listener)
    },
  }))
  const { trackedDpr } = await import('./trackedDpr')
  const seen: number[] = []
  const dispose = autorun(() => {
    seen.push(trackedDpr())
  })
  vi.stubGlobal('devicePixelRatio', 2)
  fire.at(-1)!()
  vi.stubGlobal('devicePixelRatio', 1.5)
  fire.at(-1)!()
  dispose()
  vi.unstubAllGlobals()
  expect(seen).toEqual([1, 2, 1.5])
})
