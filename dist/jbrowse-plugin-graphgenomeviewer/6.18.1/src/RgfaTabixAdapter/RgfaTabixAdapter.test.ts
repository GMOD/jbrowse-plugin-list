import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

import { TabixIndexedFile } from '@gmod/tabix'
import { parseGFA } from '@jbrowse/bandage-core/gfa-core/index'
import { readConfObject } from '@jbrowse/core/configuration'
import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter from './RgfaTabixAdapter.ts'
import configSchema from './configSchema.ts'
import { linkKey, parseLinkLine } from './rgfaBed.ts'

// Built by scripts/build_rgfa_tabix.sh from the minigraph rGFA of four E. coli
// strains at jbrowse.org/demos/ecoli_pangenome/ecoli_rgfa_slice.gfa (the
// pangenome tutorial's figure data): 161 segments across four stable sequences,
// ranks 0-3. Named rgfa_ecoli rather than ecoli_rgfa because the repo's
// .gitignore ignores `ecoli_*` (the multi-GB pangenome build dirs).
const prefix = require
  .resolve('./test_data/rgfa_ecoli.segs.bed.gz')
  .replace(/\.segs\.bed\.gz$/, '')

function makeAdapter() {
  const local = (path: string) => ({
    localPath: path,
    locationType: 'LocalPathLocation',
  })
  return new Adapter(
    configSchema.create({
      segmentsLocation: local(`${prefix}.segs.bed.gz`),
      segmentsIndex: { location: local(`${prefix}.segs.bed.gz.tbi`) },
      linksLocation: local(`${prefix}.links.bed.gz`),
      linksIndex: { location: local(`${prefix}.links.bed.gz.tbi`) },
    }),
  )
}

// The graph names its stable sequences PanSN (`K12#1#chr`); an assembly asking
// for them names them `chr` in assembly `K12`.
const k12 = {
  refName: 'chr',
  assemblyName: 'K12',
  start: 993236,
  end: 997574,
}

test('getRefNames lists the stable sequences', async () => {
  expect(await makeAdapter().getRefNames()).toEqual([
    'CFT073#1#chr',
    'K12#1#chr',
    'NCTC86#1#chr',
    'Sakai#1#chr',
  ])
})

test('getFeatures returns the segments on a stable sequence', async () => {
  const features = await firstValueFrom(
    makeAdapter().getFeatures(k12).pipe(toArray()),
  )
  expect(
    features.map(f => ({
      name: f.get('name'),
      start: f.get('start'),
      end: f.get('end'),
      rank: f.get('rank'),
    })),
  ).toEqual([
    { name: 's322', start: 993236, end: 993310, rank: 0 },
    { name: 's323', start: 993310, end: 997574, rank: 0 },
  ])
})

test('getFeatures resolves a PanSN name given unqualified', async () => {
  const qualified = await firstValueFrom(
    makeAdapter()
      .getFeatures({ ...k12, refName: 'K12#1#chr' })
      .pipe(toArray()),
  )
  expect(qualified.map(f => f.get('name'))).toEqual(['s322', 's323'])
})

test('getFeatures is empty for a sequence the graph does not anchor to', async () => {
  const features = await firstValueFrom(
    makeAdapter()
      .getFeatures({ ...k12, assemblyName: 'volvox', refName: 'ctgA' })
      .pipe(toArray()),
  )
  expect(features).toEqual([])
})

// The point of the two-file index: a region on the reference backbone reaches
// the rank>0 segments hanging off it, which live at their own coordinates on
// another stable sequence (here CFT073) and so can never be found by a
// coordinate query on this region.
test('getSubgraph reaches off-reference neighbours', async () => {
  const gfa = await makeAdapter().getSubgraph(k12)
  expect(gfa).toBe(
    [
      'H\tVN:Z:1.0',
      'S\ts1727\t*\tLN:i:226\tSN:Z:CFT073#1#chr\tSO:i:1044024\tSR:i:2',
      'S\ts1728\t*\tLN:i:75\tSN:Z:CFT073#1#chr\tSO:i:1048515\tSR:i:2',
      'S\ts322\t*\tLN:i:74\tSN:Z:K12#1#chr\tSO:i:993236\tSR:i:0',
      'S\ts323\t*\tLN:i:4264\tSN:Z:K12#1#chr\tSO:i:993310\tSR:i:0',
      'S\ts324\t*\tLN:i:7093\tSN:Z:K12#1#chr\tSO:i:997574\tSR:i:0',
      'L\ts1727\t+\ts323\t+\t0M',
      'L\ts322\t+\ts323\t+\t0M',
      'L\ts323\t+\ts1728\t+\t0M',
      'L\ts323\t+\ts324\t+\t0M',
    ].join('\n'),
  )
})

test('getSubgraph is byte-identical across calls', async () => {
  const adapter = makeAdapter()
  expect(await adapter.getSubgraph(k12)).toBe(await adapter.getSubgraph(k12))
})

// context expands by whole link hops, following each newly reached segment from
// its own stable coordinates — which every link row carries.
test('getSubgraph context adds another hop', async () => {
  const adapter = makeAdapter()
  const ids = (gfa: string) =>
    gfa
      .split('\n')
      .filter(l => l.startsWith('S'))
      .map(l => l.split('\t')[1]!)

  const near = ids(await adapter.getSubgraph(k12))
  const far = ids(await adapter.getSubgraph(k12, { hops: 1 }))
  expect(far.length).toBeGreaterThan(near.length)
  expect(far).toEqual(expect.arrayContaining(near))
})

// A hop reads the links of the round before it, so two segments reached in the
// last round had the link between them dropped and an allele reached from
// both ends drew as two stubs. Every window along K12, at one hop and two,
// holds each fixture link whose two ends it holds.
test('getSubgraph holds every link between two of its segments', async () => {
  const adapter = makeAdapter()
  const all = gunzipSync(readFileSync(`${prefix}.links.bed.gz`))
    .toString()
    .trim()
    .split('\n')
    .map(line => parseLinkLine(line))
  const among = (gfa: string) => {
    const lines = gfa.split('\n')
    const ids = new Set(
      lines.filter(l => l.startsWith('S')).map(l => l.split('\t')[1]!),
    )
    const held = new Set(
      lines
        .filter(l => l.startsWith('L'))
        .map(l => l.split('\t').slice(1, 5).join('')),
    )
    return {
      held,
      expected: new Set(
        all
          .filter(link => ids.has(link.source) && ids.has(link.target))
          .map(link => linkKey(link)),
      ),
    }
  }
  for (const hops of [1, 2]) {
    for (let start = 993_000; start < 1_315_000; start += 4000) {
      const { held, expected } = among(
        await adapter.getSubgraph(
          { ...k12, start, end: start + 8000 },
          { hops },
        ),
      )
      expect([...expected].filter(key => !held.has(key))).toEqual([])
    }
  }
})

// A hop is one query per off-reference segment, so a cut the view has replaced
// has a lot left to read. The signal reaches every query, and one that gave up
// before it started reads nothing.
test('getSubgraph stops for its signal', async () => {
  const gaveUp = new AbortController()
  gaveUp.abort()
  await expect(
    makeAdapter().getSubgraph(k12, { hops: 1, signal: gaveUp.signal }),
  ).rejects.toThrow(/abort/i)
})

test('getFeatures stops for its signal', async () => {
  const gaveUp = new AbortController()
  gaveUp.abort()
  await expect(
    firstValueFrom(
      makeAdapter().getFeatures(k12, { signal: gaveUp.signal }).pipe(toArray()),
    ),
  ).rejects.toThrow(/abort/i)
})

// A bare header drew as an empty pane with no error, which is what a missing
// assemblyNameToPanSN entry (hs1 without CHM13) looked like.
test('getSubgraph refuses a sequence the index does not hold, saying how to map one', async () => {
  await expect(
    makeAdapter().getSubgraph({
      ...k12,
      assemblyName: 'volvox',
      refName: 'ctgA',
    }),
  ).rejects.toThrow(
    /volvox ctgA is not in this graph's index.*assemblyNameToPanSN/,
  )
})

// The carriage half of the index, which no rGFA has: built by
// scripts/build_pggb_tabix.sh in jbrowse-components from the same five-strain
// pggb graph the tutorial uses, sliced to the IS5 element at K12
// chr:1,299,499-1,300,693. 24 segments spanning every carrier count from 1 to
// 5, so the fixture covers a strain-private allele and core backbone in one
// window.
const pggbPrefix = require
  .resolve('./test_data/pggb_ecoli.segs.bed.gz')
  .replace(/\.segs\.bed\.gz$/, '')

function makePggbAdapter() {
  const local = (path: string) => ({
    localPath: path,
    locationType: 'LocalPathLocation',
  })
  return new Adapter(
    configSchema.create({
      segmentsLocation: local(`${pggbPrefix}.segs.bed.gz`),
      segmentsIndex: { location: local(`${pggbPrefix}.segs.bed.gz.tbi`) },
      linksLocation: local(`${pggbPrefix}.links.bed.gz`),
      linksIndex: { location: local(`${pggbPrefix}.links.bed.gz.tbi`) },
    }),
  )
}

const is5 = {
  refName: 'chr',
  assemblyName: 'K12',
  start: 1299260,
  end: 1300800,
}

// The lane this exists for: color a linear track by how many haplotypes carry
// each segment. Before this the tag column reached the graph view's node popup
// and stopped there, so a feature could say its rank but not its carriage.
test('getSubgraph refuses a range that is not finite before querying', async () => {
  const getLines = vi
    .spyOn(TabixIndexedFile.prototype, 'getLines')
    .mockResolvedValue()
  await expect(
    makeAdapter().getSubgraph({ ...k12, end: Number.NaN }, { hops: 1 }),
  ).rejects.toThrow(/K12#1#chr:993236-NaN is not a finite range/)
  expect(getLines).not.toHaveBeenCalled()
  getLines.mockRestore()
})

test('getFeatures carries SM:Z: onto the feature', async () => {
  const features = await firstValueFrom(
    makePggbAdapter().getFeatures(is5).pipe(toArray()),
  )
  const private1199 = features.find(f => f.get('name') === '196827')!
  expect(private1199.get('end') - private1199.get('start')).toBe(1199)
  expect(private1199.get('samples')).toEqual(['K12.1'])
  expect(private1199.get('sampleCount')).toBe(1)

  const core = features.find(f => f.get('name') === '196843')!
  expect(core.get('samples')).toEqual([
    'K12.1',
    'Sakai.1',
    'CFT073.1',
    'NCTC86.1',
    'IAI39.1',
  ])
  expect(core.get('sampleCount')).toBe(5)
})

// The other half of the same fixture: the graph route reads the samples off the
// synthesized S-line, and rgfaBed.test.ts asserts that from a hand-written row.
// This is the same claim against a real indexed file.
test('getSubgraph keeps the tag on the S-line it synthesizes', async () => {
  const gfa = await makePggbAdapter().getSubgraph(is5)
  expect(gfa.split('\n')).toContain(
    'S\t196827\t*\tLN:i:1199\tSN:Z:K12#1#chr\tSO:i:1299498\tSR:i:0\tSM:Z:K12.1',
  )
})

// An rGFA has no sixth column, so the attribute is absent rather than 0: a
// color expression reading `sampleCount` on such a track gets undefined, not a
// count of zero.
test('getFeatures omits samples on a graph that records none', async () => {
  const features = await firstValueFrom(
    makeAdapter().getFeatures(k12).pipe(toArray()),
  )
  expect(features.length).toBeGreaterThan(0)
  expect(features.every(f => f.get('samples') === undefined)).toBe(true)
  expect(features.every(f => f.get('sampleCount') === undefined)).toBe(true)
})

// Minigraph-Cactus writes PanSN stable names, so HPRC release 2 calls the
// reference `GRCh38#0#chr1` while the JBrowse assembly is `hg38`. This reuses
// the `assemblyNameToPanSN` slot and helper the all-vs-all PAF adapters use.
// Matching on the bare contig instead is not an option: that graph also carries
// `CHM13#0#chr1`, so it would silently resolve to the wrong sample.
function makeMappedAdapter(assemblyNameToPanSN: Record<string, string>) {
  const local = (path: string) => ({
    localPath: path,
    locationType: 'LocalPathLocation',
  })
  return new Adapter(
    configSchema.create({
      segmentsLocation: local(`${prefix}.segs.bed.gz`),
      segmentsIndex: { location: local(`${prefix}.segs.bed.gz.tbi`) },
      linksLocation: local(`${prefix}.links.bed.gz`),
      linksIndex: { location: local(`${prefix}.links.bed.gz.tbi`) },
      assemblyNameToPanSN,
    }),
  )
}

// the fixture's sample is `K12`, so an assembly named anything else needs the map
const renamed = { ...k12, assemblyName: 'ecoli_k12' }

test('maps an assembly name to a differing PanSN sample prefix', async () => {
  const features = await firstValueFrom(
    makeMappedAdapter({ ecoli_k12: 'K12' })
      .getFeatures(renamed)
      .pipe(toArray()),
  )
  expect(features.length).toBeGreaterThan(0)
  expect(features.every(f => f.get('refName') === 'chr')).toBe(true)
})

test('without the mapping the same query resolves nothing', async () => {
  const features = await firstValueFrom(
    makeMappedAdapter({}).getFeatures(renamed).pipe(toArray()),
  )
  expect(features).toEqual([])
})

test('getSubgraph resolves through the mapping too', async () => {
  const gfa = await makeMappedAdapter({ ecoli_k12: 'K12' }).getSubgraph(renamed)
  expect(gfa.split('\n').filter(l => l.startsWith('S')).length).toBeGreaterThan(
    0,
  )
})

// The same four strains at one node per bubble: `gfatools bubble` over
// test_data/ecoli_rgfa_slice.gfa, collapsed by build_bubble_tier.sh in
// jbrowse-components at `--min-content 1000`. 14 bubbles over K12's 322 kb,
// against 161 segments in the fine pair.
function makeTieredAdapter() {
  const local = (path: string) => ({
    localPath: path,
    locationType: 'LocalPathLocation',
  })
  const tier = `${prefix}.tier1000`
  return new Adapter(
    configSchema.create({
      segmentsLocation: local(`${prefix}.segs.bed.gz`),
      segmentsIndex: { location: local(`${prefix}.segs.bed.gz.tbi`) },
      linksLocation: local(`${prefix}.links.bed.gz`),
      linksIndex: { location: local(`${prefix}.links.bed.gz.tbi`) },
      coarse: {
        aboveBpPerPx: 100,
        segmentsLocation: local(`${tier}.segs.bed.gz`),
        segmentsIndex: { location: local(`${tier}.segs.bed.gz.tbi`) },
        linksLocation: local(`${tier}.links.bed.gz`),
        linksIndex: { location: local(`${tier}.links.bed.gz.tbi`) },
      },
    }),
  )
}

const k12Span = {
  refName: 'chr',
  assemblyName: 'K12',
  start: 993236,
  end: 1315741,
}

test("getSubgraph with tier: 'coarse' cuts the coarse pair", async () => {
  const adapter = makeTieredAdapter()
  const fine = parseGFA(await adapter.getSubgraph(k12Span))
  const coarse = parseGFA(
    await adapter.getSubgraph(k12Span, { tier: 'coarse' }),
  )
  const bubbles = coarse.nodes.filter(n => n.tags.ct === 'bubble')
  expect(bubbles).toHaveLength(14)
  expect(coarse.nodes.every(n => n.tags.ct !== undefined)).toBe(true)
  expect(fine.nodes.every(n => n.tags.ct === undefined)).toBe(true)
  expect([fine.nodes.length, coarse.nodes.length]).toEqual([106, 28])
  // a bubble keeps its source segment's id, so it joins back to the fine pair
  const fineIds = new Set(fine.nodes.map(n => n.id))
  expect(bubbles.every(n => fineIds.has(n.id))).toBe(true)
})

test('the coarse uri shorthand resolves a pair against the adapter baseUri', () => {
  const config = configSchema.create({
    uri: 'hprc',
    baseUri: 'https://example.com/',
    coarse: { uri: 'hprc.tier10000', aboveBpPerPx: 1000 },
  })
  expect(readConfObject(config, ['coarse', 'aboveBpPerPx'])).toBe(1000)
  expect(readConfObject(config, ['coarse', 'segmentsLocation'])).toMatchObject({
    uri: 'hprc.tier10000.segs.bed.gz',
    baseUri: 'https://example.com/',
  })
  expect(
    readConfObject(config, ['coarse', 'linksIndex', 'location']),
  ).toMatchObject({ uri: 'hprc.tier10000.links.bed.gz.tbi' })
})

test('the coarse pair takes the csi indexes its adapter states', () => {
  const config = configSchema.create({
    uri: 'hprc',
    csi: true,
    coarse: { uri: 'hprc.tier10000', aboveBpPerPx: 1000 },
  })
  expect(
    readConfObject(config, ['coarse', 'linksIndex', 'location']),
  ).toMatchObject({ uri: 'hprc.tier10000.links.bed.gz.csi' })
  expect(readConfObject(config, ['coarse', 'linksIndex', 'indexType'])).toBe(
    'CSI',
  )
})

test('a track with no coarse pair states no threshold', () => {
  const config = configSchema.create({ uri: 'hprc' })
  expect(readConfObject(config, ['coarse', 'aboveBpPerPx'])).toBeUndefined()
})

// The same graph through `gfa-to-tabix` 0.2.0's anchored layout, which files
// each allele under the reference interval its bubble hangs from.
function makeAnchoredAdapter() {
  const local = (path: string) => ({
    localPath: path,
    locationType: 'LocalPathLocation',
  })
  const anchored = `${prefix}_anchored`
  return new Adapter(
    configSchema.create({
      segmentsLocation: local(`${anchored}.segs.bed.gz`),
      segmentsIndex: { location: local(`${anchored}.segs.bed.gz.tbi`) },
      linksLocation: local(`${anchored}.links.bed.gz`),
      linksIndex: { location: local(`${anchored}.links.bed.gz.tbi`) },
    }),
  )
}

function segmentIds(gfa: string) {
  return gfa
    .split('\n')
    .filter(l => l.startsWith('S'))
    .map(l => l.split('\t')[1]!)
}

test('an anchored index lists segments on the queried sequence only', async () => {
  const features = await firstValueFrom(
    makeAnchoredAdapter().getFeatures(k12).pipe(toArray()),
  )
  expect(features.map(f => f.get('name'))).toEqual(['s322', 's323'])
})

test('an anchored index returns the whole cut without hops', async () => {
  const walked = segmentIds(await makeAdapter().getSubgraph(k12, { hops: 20 }))
  const anchored = await makeAnchoredAdapter().getSubgraph(k12)
  expect(segmentIds(anchored)).toEqual(expect.arrayContaining(walked))
  expect(await makeAnchoredAdapter().getSubgraph(k12, { hops: 3 })).toBe(
    anchored,
  )
})

test('an anchored cut holds every link between two of its segments', async () => {
  const all = gunzipSync(readFileSync(`${prefix}.links.bed.gz`))
    .toString()
    .split('\n')
    .filter(Boolean)
    .map(line => parseLinkLine(line))
  const adapter = makeAnchoredAdapter()
  for (let start = 900000; start < 1100000; start += 10000) {
    const gfa = await adapter.getSubgraph({ ...k12, start, end: start + 10000 })
    const held = new Set(segmentIds(gfa))
    const drawn = new Set(
      gfa
        .split('\n')
        .filter(l => l.startsWith('L'))
        .map(l => {
          const [, source, sourceStrand, target, targetStrand] = l.split('\t')
          return `${source}${sourceStrand}${target}${targetStrand}`
        }),
    )
    for (const link of all) {
      if (held.has(link.source) && held.has(link.target)) {
        expect(drawn).toContain(linkKey(link))
      }
    }
  }
})

// The cut worked out from the whole graph with no index: the backbone under
// the window, every bubble whose backbone attachments span it, the backbone
// links that jump the window, the segments one link out, and the links among
// all of those.
function expectedCut(start: number, end: number) {
  const rows = (kind: string) =>
    gunzipSync(readFileSync(`${prefix}.${kind}.bed.gz`))
      .toString()
      .split('\n')
      .filter(Boolean)
  const segments = new Map(
    rows('segs').map(line => {
      const [refName, s, e, id, rank] = line.split('\t')
      return [id!, { refName: refName!, start: +s!, end: +e!, rank: +rank! }]
    }),
  )
  const links = [
    ...new Map(
      rows('links').map(line => {
        const link = parseLinkLine(line)
        return [linkKey(link), link]
      }),
    ).values(),
  ]
  const component = new Map<string, string>()
  const find = (id: string): string => {
    const parent = component.get(id) ?? id
    if (parent === id) {
      return id
    }
    const root = find(parent)
    component.set(id, root)
    return root
  }
  const allele = (id: string) => segments.get(id)!.rank !== 0
  for (const link of links) {
    if (allele(link.source) && allele(link.target)) {
      component.set(find(link.source), find(link.target))
    }
  }
  const span = new Map<string, { start: number; end: number }>()
  for (const link of links) {
    for (const [a, b] of [
      [link.source, link.target],
      [link.target, link.source],
    ] as const) {
      if (allele(a) && !allele(b)) {
        const anchor = segments.get(b)!
        const held = span.get(find(a)) ?? { start: Infinity, end: -Infinity }
        span.set(find(a), {
          start: Math.min(held.start, anchor.start),
          end: Math.max(held.end, anchor.end),
        })
      }
    }
  }
  const overlaps = (s: { start: number; end: number }) =>
    s.start < end && s.end > start
  const under = new Set(
    [...segments.keys()].filter(id => {
      const segment = segments.get(id)!
      return allele(id)
        ? overlaps(span.get(find(id)) ?? { start: 0, end: 0 })
        : segment.refName === 'K12#1#chr' && overlaps(segment)
    }),
  )
  const side = (id: string) => {
    const segment = segments.get(id)!
    return allele(id) || segment.refName !== 'K12#1#chr'
      ? 0
      : segment.end <= start
        ? -1
        : segment.start >= end
          ? 1
          : 0
  }
  const touching = links.filter(
    l =>
      under.has(l.source) ||
      under.has(l.target) ||
      side(l.source) * side(l.target) === -1,
  )
  const held = new Set([
    ...under,
    ...touching.flatMap(l => [l.source, l.target]),
  ])
  return {
    segments: [...held].sort(),
    links: links
      .filter(l => held.has(l.source) && held.has(l.target))
      .map(l => linkKey(l))
      .sort(),
  }
}

test('an anchored cut equals the cut worked out from the whole graph', async () => {
  const adapter = makeAnchoredAdapter()
  for (const width of [1, 500, 10000, 150000]) {
    for (let start = 880000; start < 1120000; start += 7001) {
      const end = start + width
      const gfa = await adapter.getSubgraph({ ...k12, start, end })
      const drawn = gfa
        .split('\n')
        .filter(l => l.startsWith('L'))
        .map(l => {
          const [, source, sourceStrand, target, targetStrand] = l.split('\t')
          return `${source}${sourceStrand}${target}${targetStrand}`
        })
      expect({
        segments: segmentIds(gfa).sort(),
        links: drawn.sort(),
      }).toEqual(expectedCut(start, end))
    }
  }
})

// s325 links straight to s327, a deletion of s326. A window inside s326
// touches neither end, and the link is drawn all the same.
test('an anchored cut keeps a backbone link that jumps the window', async () => {
  const gfa = await makeAnchoredAdapter().getSubgraph({
    ...k12,
    start: 1007700,
    end: 1007710,
  })
  expect(gfa).toContain('L\ts325\t+\ts327\t+\t0M')
  const drawn = gfa
    .split('\n')
    .filter(l => l.startsWith('L'))
    .map(l => {
      const [, source, sourceStrand, target, targetStrand] = l.split('\t')
      return `${source}${sourceStrand}${target}${targetStrand}`
    })
  expect({ segments: segmentIds(gfa).sort(), links: drawn.sort() }).toEqual(
    expectedCut(1007700, 1007710),
  )
})
