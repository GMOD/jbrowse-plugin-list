import { PanSNRefNames } from './panSNTabix.ts'

// The index's names are read once and every query awaits that one read. It is
// shared, so it cannot take on one caller's signal: a track fetch the user
// panned away from rejected the read the graph view's cut was also waiting on,
// and the cut failed with an abort nobody had asked of it.
describe('the shared read of the index names', () => {
  const region = { assemblyName: 'hg38', refName: 'chr6', start: 0, end: 10 }
  const adapter = { getConf: () => undefined }

  test('one caller giving up does not fail another waiting on the same read', async () => {
    let release = (_names: string[]) => {}
    let reads = 0
    const file = {
      getReferenceSequenceNames: (opts?: { signal?: AbortSignal }) =>
        new Promise<string[]>((resolve, reject) => {
          reads++
          release = resolve
          opts?.signal?.addEventListener('abort', () => {
            reject(new DOMException('aborted', 'AbortError'))
          })
        }),
    }
    const refNames = new PanSNRefNames(file as never, adapter as never)
    const gaveUp = new AbortController()
    const first = refNames.resolve(region, { signal: gaveUp.signal })
    const second = refNames.resolve(region)
    gaveUp.abort()
    await expect(first).rejects.toMatchObject({ name: 'AbortError' })
    release(['chr6'])
    await expect(second).resolves.toBe('chr6')
    expect(reads).toBe(1)
  })

  test('a read that fails is tried again by the next query', async () => {
    let attempt = 0
    const file = {
      getReferenceSequenceNames: () =>
        ++attempt === 1
          ? Promise.reject(new Error('network'))
          : Promise.resolve(['chr6']),
    }
    const refNames = new PanSNRefNames(file as never, adapter as never)
    await expect(refNames.resolve(region)).rejects.toThrow('network')
    await expect(refNames.resolve(region)).resolves.toBe('chr6')
  })
})

describe('a region the file holds no name for', () => {
  const adapter = { getConf: () => undefined }
  const refNamesOf = (names: string[]) =>
    new PanSNRefNames(
      { getReferenceSequenceNames: () => Promise.resolve(names) } as never,
      adapter as never,
    )
  const chrM = { assemblyName: 'hg38', refName: 'chrM', start: 0, end: 10 }

  test('is an unmapped assembly where every name is PanSN under another prefix', async () => {
    await expect(
      refNamesOf(['GRCh38#0#chr1', 'HG002#1#chr1']).resolveMapped(chrM),
    ).rejects.toThrow(/hg38 chrM is not in this graph's index/)
  })

  test('is a contig the graph lacks where the reference is named bare', async () => {
    await expect(
      refNamesOf(['chr1', 'HG002#1#chr1']).resolveMapped(chrM),
    ).resolves.toBeUndefined()
  })

  // an assemblyNameToPanSN hint would send the user to fix a config that is
  // already right
  test('fails a cut by saying the graph has nothing there', async () => {
    await expect(
      refNamesOf(['chr1', 'HG002#1#chr1']).resolveForCut(chrM),
    ).rejects.toThrow('This graph has nothing on hg38 chrM')
  })
})

// A walk file indexes `chr1~851968`-style detail sequences beside its contigs
test("a walk file's detail sequences are not contigs", async () => {
  const refNames = new PanSNRefNames(
    {
      getReferenceSequenceNames: () =>
        Promise.resolve(['chr1', 'chr1~851968', 'chr2', 'chr2~65536']),
    } as never,
    { getConf: () => undefined } as never,
  )
  expect(await refNames.assemblyRefNames()).toEqual(['chr1', 'chr2'])
  expect(
    await refNames.resolve({
      assemblyName: 'hg38',
      refName: 'chr1~851968',
      start: 0,
      end: 1,
    }),
  ).toBeUndefined()
})
