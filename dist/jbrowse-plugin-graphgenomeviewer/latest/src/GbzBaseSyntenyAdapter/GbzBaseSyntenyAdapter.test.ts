import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter, {
  NoReferenceSampleError,
  laneAssemblyName,
} from './GbzBaseSyntenyAdapter.ts'
import configSchema from './configSchema.ts'

import type { SyntenyMate } from '@jbrowse/synteny-core'

// micb-kir3dl1.gbz.db is gbwt-rs's 46-sample HPRC slice (MICB on chr6, KIR3DL1
// on chr19), built by upstream gbz-base and augmented with the haplotype side
// tables by gbz-haplotype-index; its GRCh38 chr6 fragment starts at 31498140
const loc = () => ({
  localPath: require.resolve('./test_data/micb-kir3dl1.gbz.db'),
  locationType: 'LocalPathLocation' as const,
})

function makeAdapter(conf: Record<string, unknown> = {}) {
  return new Adapter(
    configSchema.create({
      gbzDbLocation: loc(),
      assemblyNames: ['hg38'],
      assemblyNameToPanSN: { hg38: 'GRCh38#0' },
      context: 0,
      ...conf,
    }),
  )
}

const feats = (
  adapter: Adapter,
  region: Record<string, unknown>,
  opts: Record<string, unknown> = {},
) =>
  firstValueFrom(
    adapter.getFeatures(region as never, opts as never).pipe(toArray()),
  )

const clipped = (adapter: Adapter, region: Record<string, unknown>) =>
  firstValueFrom(
    adapter
      .getFeaturesInMultipleRegions([region] as never, {
        clipToRegion: true,
      })
      .pipe(toArray()),
  )

const mateOf = (f: { get: (k: string) => unknown }) =>
  f.get('mate') as SyntenyMate

const window = {
  refName: 'chr6',
  start: 31500000,
  end: 31501000,
  assemblyName: 'hg38',
}

test('the anchor window answers one record per haplotype fragment, PanSN-named and overlapping the window', async () => {
  const fa = await feats(makeAdapter(), window)
  expect(fa.length).toBeGreaterThan(40)
  const lanes = new Set(fa.map(f => mateOf(f).assemblyName))
  expect(lanes.size).toBeGreaterThan(40)
  for (const lane of lanes) {
    expect(lane).toMatch(/^[^#]+#\d+$/)
  }
  for (const f of fa) {
    expect(f.get('assemblyName')).toBe('hg38')
    expect(f.get('refName')).toBe('chr6')
    // a record runs to its node boundaries; the base class clips it to the
    // window when asked
    expect(f.get('start')).toBeLessThan(window.end)
    expect(f.get('end')).toBeGreaterThan(window.start)
    expect(f.get('end')).toBeGreaterThan(f.get('start'))
    expect(f.get('CIGAR')).toMatch(/^(\d+[MID])+$/)
    expect([1, -1]).toContain(f.get('strand'))
    const mate = mateOf(f)
    expect(mate.end).toBeGreaterThan(mate.start)
    expect(mate.refName).not.toBe('')
  }
  expect(fa.some(f => f.get('strand') === -1)).toBe(true)
  expect(fa.some(f => f.get('strand') === 1)).toBe(true)
})

test('the other reference sample is a lane too, at its own prefix', async () => {
  const fa = await feats(makeAdapter(), window)
  expect(fa.some(f => mateOf(f).assemblyName === 'CHM13#0')).toBe(true)
})

test('a listed haplotype assembly labels its lane', async () => {
  const [first] = await feats(makeAdapter(), window)
  const prefix = mateOf(first!).assemblyName
  const fa = await feats(
    makeAdapter({
      assemblyNames: ['hg38', 'hap_a'],
      assemblyNameToPanSN: { hg38: 'GRCh38#0', hap_a: prefix },
    }),
    window,
  )
  expect(fa.some(f => mateOf(f).assemblyName === 'hap_a')).toBe(true)
  expect(fa.some(f => mateOf(f).assemblyName === prefix)).toBe(false)
})

test('a mapped haplotype assembly labels its lane without a second listing', async () => {
  const [first] = await feats(makeAdapter(), window)
  const prefix = mateOf(first!).assemblyName
  const adapter = makeAdapter({
    assemblyNames: ['hg38'],
    assemblyNameToPanSN: { hg38: 'GRCh38#0', hap_a: prefix },
  })
  const fa = await feats(adapter, window)
  expect(fa.some(f => mateOf(f).assemblyName === 'hap_a')).toBe(true)
  const { lanes } = await adapter.getHeader()
  expect(lanes.find(l => l.label === prefix)?.name).toBe('hap_a')
})

test('ids are the same across two fetches of one window', async () => {
  const adapter = makeAdapter()
  const ids = async () => (await feats(adapter, window)).map(f => f.id()).sort()
  const a = await ids()
  expect(new Set(a).size).toBe(a.length)
  expect(await ids()).toEqual(a)
  expect(a[0]).toMatch(/^[^#]+#\d+#chr6@\d+\.\d+$/)
})

test('clipToRegion cuts a record to the window and drops its CIGAR', async () => {
  const fa = await clipped(makeAdapter(), {
    ...window,
    start: 31500200,
    end: 31500400,
  })
  expect(fa.length).toBeGreaterThan(0)
  for (const f of fa) {
    expect(f.get('start')).toBeGreaterThanOrEqual(31500200)
    expect(f.get('end')).toBeLessThanOrEqual(31500400)
    expect(f.get('CIGAR')).toBeUndefined()
    expect(f.id()).toMatch(/:31500200-31500400$/)
  }
})

test('a target assembly keeps only that haplotype', async () => {
  const adapter = makeAdapter()
  const all = await feats(adapter, window)
  const prefix = mateOf(all[0]!).assemblyName
  const one = await feats(adapter, window, { targetAssemblyName: prefix })
  expect(one.length).toBeGreaterThan(0)
  expect(one.every(f => mateOf(f).assemblyName === prefix)).toBe(true)
  expect(one.length).toBe(
    all.filter(f => mateOf(f).assemblyName === prefix).length,
  )
})

// A pairwise synteny view names its one lane as the target. The target was
// applied to what came back, so gbz-base was handed no predicate, walked every
// haplotype in the graph and had all but one thrown away.
test('a target assembly is what gbz-base is asked to walk', async () => {
  const adapter = makeAdapter()
  const all = await feats(adapter, window)
  const target = mateOf(all[0]!).assemblyName
  const other = all
    .map(f => mateOf(f).assemblyName)
    .find(name => name !== target)!
  const { db } = await (
    adapter as unknown as {
      graph: () => Promise<{ db: { getAlignmentsForRange: unknown } }>
    }
  ).graph()
  const read = vi.spyOn(db, 'getAlignmentsForRange')

  await feats(adapter, window, { targetAssemblyName: target })
  const { keep } = read.mock.calls.at(-1)![3] as {
    keep?: (name: { sample: string; haplotype: number }) => boolean
  }
  const named = (lane: string) => {
    const [sample, haplotype] = lane.split('#')
    return { sample: sample!, haplotype: +haplotype!, contig: '', fragment: 0 }
  }
  expect(keep?.(named(target))).toBe(true)
  expect(keep?.(named(other))).toBe(false)
  read.mockRestore()
})

test('a window on a haplotype lane answers nothing, with or without a target', async () => {
  const adapter = makeAdapter()
  const region = { ...window, assemblyName: 'HG00438#1' }
  expect(await feats(adapter, region)).toEqual([])
  expect(
    await feats(adapter, region, { targetAssemblyName: 'HG00621#2' }),
  ).toEqual([])
})

test('a window before the reference fragment is empty rather than an error', async () => {
  expect(
    await feats(makeAdapter(), { ...window, start: 0, end: 1000 }),
  ).toEqual([])
})

test('a window past the fragment end is clamped to it', async () => {
  const fa = await feats(makeAdapter(), {
    ...window,
    start: 31500000,
    end: 40000000,
  })
  expect(fa.length).toBeGreaterThan(0)
})

test('the reference contigs are the anchor refNames; a haplotype prefix lists its own', async () => {
  const adapter = makeAdapter()
  const anchor = await adapter.getRefNames({ assemblyName: 'hg38' })
  expect(anchor).toEqual(expect.arrayContaining(['chr6', 'chr19']))
  expect(anchor).not.toContain('chrM')
  // the haplotypes' contigs are GenBank scaffold names, not chromosomes
  const hap = await adapter.getRefNames({ assemblyName: 'HG00438#1' })
  expect(hap.length).toBeGreaterThan(0)
  expect(hap).not.toContain('chr6')
  expect(await adapter.getRefNames({ assemblyName: 'nobody' })).toEqual([])
})

test('the reference sample comes from the anchor prefix, the tag, or the slot', async () => {
  expect(await makeAdapter().getHeader()).toMatchObject({
    hasCoarseTier: false,
    anchorAssemblyName: 'hg38',
    referenceSample: 'GRCh38',
    referenceSamples: ['CHM13', 'GRCh38'],
  })
  expect(
    (
      await makeAdapter({
        assemblyNames: ['GRCh38'],
        assemblyNameToPanSN: {},
      }).getHeader()
    ).referenceSample,
  ).toBe('GRCh38')
  await expect(
    makeAdapter({ assemblyNameToPanSN: {} }).getHeader(),
  ).rejects.toThrow(NoReferenceSampleError)
  const chm13 = makeAdapter({
    assemblyNameToPanSN: {},
    referenceSample: 'CHM13',
  })
  expect((await chm13.getHeader()).referenceSample).toBe('CHM13')
  const fa = await feats(chm13, {
    refName: 'chr6',
    start: 31352000,
    end: 31352500,
    assemblyName: 'hg38',
  })
  expect(fa.length).toBeGreaterThan(0)
  expect(fa.some(f => mateOf(f).assemblyName === 'GRCh38#0')).toBe(true)
})

// One record per haplotype contig through the window, at any context: gbz-base
// joins the pieces of a walk that leaves the window's nodes and comes back.
// HG03516#2 carries this window on two contigs (JAGYYS010000003.1 forward and
// JAGYYS010000196.1 reverse), and those are two walks, so 89 lanes are 90
// records
test('context does not decide the record count: one record per haplotype contig at 0 and at 1000', async () => {
  const walks = (fs: Awaited<ReturnType<typeof feats>>) =>
    new Set(fs.map(f => `${mateOf(f).assemblyName}/${mateOf(f).refName}`))
  const wide = await feats(makeAdapter({ context: 1000 }), window)
  expect(wide.length).toBe(walks(wide).size)
  expect(new Set(wide.map(f => mateOf(f).assemblyName)).size).toBe(
    wide.length - 1,
  )
  const narrow = await feats(makeAdapter(), window)
  expect(narrow.length).toBe(wide.length)
  expect(walks(narrow)).toEqual(walks(wide))
})

test('the header declares every haplotype but the reference as a lane, named the way its features are', async () => {
  const { lanes } = await makeAdapter({
    assemblyNames: ['hg38', 'HG00621.1'],
    assemblyNameToPanSN: { hg38: 'GRCh38#0', 'HG00621.1': 'HG00621#1' },
  }).getHeader()
  expect(lanes.length).toBeGreaterThan(50)
  expect(lanes.some(l => l.group === 'GRCh38')).toBe(false)
  expect(lanes.find(l => l.label === 'CHM13#0')).toEqual({
    name: 'CHM13#0',
    label: 'CHM13#0',
    group: 'CHM13',
  })
  expect(lanes.find(l => l.label === 'HG00621#1')).toEqual({
    name: 'HG00621.1',
    label: 'HG00621#1',
    group: 'HG00621',
  })
  expect(lanes.find(l => l.label === 'HG00621#2')?.name).toBe('HG00621#2')
})

test('the graph lists its haplotypes with their contigs, and a fetch can be narrowed to some of them', async () => {
  const adapter = makeAdapter()
  const haplotypes = await adapter.getHaplotypes()
  expect(haplotypes.length).toBeGreaterThan(50)
  const grch38 = haplotypes.find(h => h.prefix === 'GRCh38#0')
  expect(grch38?.isReference).toBe(true)
  expect(grch38?.contigs).toContain('chr6')
  const hg00621 = haplotypes.filter(h => h.sample === 'HG00621')
  expect(hg00621.map(h => h.haplotype).sort()).toEqual([1, 2])
  const all = await feats(adapter, window)
  const some = await feats(adapter, window, {
    haplotypes: ['HG00621', 'HG00438#1'],
  })
  const lanes = new Set(some.map(f => mateOf(f).assemblyName))
  expect(some.length).toBeGreaterThan(0)
  expect(some.length).toBeLessThan(all.length)
  expect(
    [...lanes].every(l => l.startsWith('HG00621#') || l === 'HG00438#1'),
  ).toBe(true)
  const mapped = makeAdapter({
    assemblyNames: ['hg38', 'HG00621.1'],
    assemblyNameToPanSN: { hg38: 'GRCh38#0', 'HG00621.1': 'HG00621#1' },
  })
  const byAssemblyName = await feats(mapped, window, {
    haplotypes: ['HG00621.1'],
  })
  expect(byAssemblyName.length).toBeGreaterThan(0)
  expect(new Set(byAssemblyName.map(f => mateOf(f).assemblyName))).toEqual(
    new Set(['HG00621.1']),
  )
})

test('the node limit fails a window rather than reading it whole, naming a zoom that fits', async () => {
  await expect(feats(makeAdapter({ nodeLimit: 2 }), window)).rejects.toThrow(
    /nodeLimit \(2\) graph nodes; zoom in to about \d+ bp/,
  )
})

test('a lane name resolves at haplotype depth before sample depth', () => {
  const name = { sample: 'HG002', haplotype: 2, contig: 'chr1', fragment: 0 }
  expect(laneAssemblyName({}, name)).toBe('HG002#2')
  expect(laneAssemblyName({ HG002: 'hg002' }, name)).toBe('hg002')
  expect(laneAssemblyName({ HG002: 'hg002', 'HG002#2': 'hg002_p' }, name)).toBe(
    'hg002_p',
  )
})

const gfaLines = (gfa: string, kind: string) =>
  gfa.split('\n').filter(line => line.startsWith(`${kind}\t`))

test('getSubgraph cuts the window as GFA with the reference walk first and every haplotype PanSN-named', async () => {
  const gfa = await makeAdapter().getSubgraph(window)
  expect(gfaLines(gfa, 'H')[0]).toBe('H\tVN:Z:1.1\tRS:Z:GRCh38')
  expect(gfaLines(gfa, 'S').length).toBeGreaterThan(30)
  expect(gfaLines(gfa, 'L').length).toBeGreaterThan(30)
  const walks = gfaLines(gfa, 'W').map(line => line.split('\t'))
  expect(walks.length).toBeGreaterThan(40)
  expect(walks[0]!.slice(1, 5)).toEqual(['GRCh38', '0', 'chr6', '31499826'])
  for (const walk of walks) {
    expect(walk[2]).toMatch(/^\d+$/)
    expect(walk[1]).not.toBe('unknown')
    expect(walk[6]).toMatch(/^([<>]\d+)+$/)
  }
})

test('getSubgraph with contained snarls holds more nodes than the reference walk alone', async () => {
  const region = { ...window, start: 31500000, end: 31501000 }
  const withSnarls = await makeAdapter().getSubgraph(region)
  const without = await makeAdapter({ subgraphSnarls: 'none' }).getSubgraph(
    region,
  )
  expect(gfaLines(withSnarls, 'S').length).toBeGreaterThan(
    gfaLines(without, 'S').length,
  )
})

test('a companion haplotype index names the walks the same way', async () => {
  const companion = makeAdapter({
    haplotypeIndexLocation: {
      localPath: require.resolve('./test_data/micb-kir3dl1.haplotype-index.db'),
      locationType: 'LocalPathLocation',
    },
  })
  const [a, b] = await Promise.all([
    makeAdapter().getSubgraph(window as never),
    companion.getSubgraph(window as never),
  ])
  expect(b).toBe(a)
  const fa = await feats(companion, window)
  expect(fa.length).toBeGreaterThan(40)
})

// The set reaches gbz-base as its keep predicate, so the cut is the chosen
// walks and the nodes they visit: fewer S lines, not just fewer W lines. Lane
// names resolve through assemblyNameToPanSN the way getFeatures's do.
test('getSubgraph for a haplotype set keeps those walks, the reference, and only their nodes', async () => {
  const adapter = makeAdapter({
    assemblyNames: ['hg38', 'hg01106_p'],
    assemblyNameToPanSN: { hg38: 'GRCh38#0', hg01106_p: 'HG01106#1' },
  })
  const whole = await adapter.getSubgraph(window)
  const kept = await adapter.getSubgraph(window, {
    haplotypes: ['hg01106_p', 'HG01106#2'],
  })
  const samples = (gfa: string) =>
    gfaLines(gfa, 'W').map(line => line.split('\t').slice(1, 3).join('#'))
  expect(samples(kept)[0]).toBe('GRCh38#0')
  expect(samples(kept).slice(1).sort()).toEqual(['HG01106#1', 'HG01106#2'])
  expect(gfaLines(kept, 'S').length).toBeLessThan(gfaLines(whole, 'S').length)
  expect(gfaLines(kept, 'S').length).toBeGreaterThan(0)
  expect(await adapter.getSubgraph(window, { haplotypes: [] })).toBe(whole)
})

test('getFeatures for a haplotype set answers the same records as filtering the whole window', async () => {
  const all = await feats(makeAdapter(), window)
  const some = await feats(makeAdapter(), window, { haplotypes: ['HG01106'] })
  const ids = (fs: { id: () => string }[]) => fs.map(f => f.id()).sort()
  expect(some.length).toBe(2)
  expect(ids(some)).toEqual(
    ids(all.filter(f => mateOf(f).assemblyName.startsWith('HG01106#'))),
  )
})

// A lane's window is in its own contig's coordinates, which the graph is not
// indexed on; the adapter says so rather than answering '' for the view to
// report as "no GFA".
test('getSubgraph refuses a window on a haplotype lane with a message naming the anchor', async () => {
  await expect(
    makeAdapter().getSubgraph({ ...window, assemblyName: 'HG01106#1' }),
  ).rejects.toThrow(/cut on its reference, hg38; a window on HG01106#1/)
})

test('getSubgraph outside every reference fragment is empty', async () => {
  expect(
    await makeAdapter().getSubgraph({ ...window, start: 100, end: 200 }),
  ).toBe('')
})
