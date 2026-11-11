// LAUNCH_LABEL rather than the literal: the host renamed this submenu from
// "Launch view" to "Launch" (packages/core/src/ui/launchViewMenu.ts says why),
// and a hardcoded copy here fails as "the item was never added" rather than as
// "the submenu is called something else".

import { readConfObject } from '@jbrowse/core/configuration'
import { LAUNCH_LABEL } from '@jbrowse/core/ui'
import { applySnapshot, destroy, getSnapshot } from '@jbrowse/mobx-state-tree'

import { mockRpcCall, mockSession } from './modelTestMocks'
import { TEST_TRACK } from './modelTestSupport'
import stateModelFactory from './viewModel'

import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'

vi.mock('@jbrowse/core/util', async () =>
  (await import('./modelTestMocks')).coreUtilMock(),
)
vi.mock(import('@jbrowse/core/configuration'), async importOriginal =>
  (await import('./modelTestMocks')).configurationMock(await importOriginal()),
)
vi.mock('@jbrowse/core/util/io', async () =>
  (await import('./modelTestMocks')).ioMock(),
)

// The graph's own way out. Shaped after the two graphs this view actually ships
// with, because they behave completely differently: every E. coli strain is a
// loaded assembly, and none of HPRC's contributing haplotypes is.
describe('launching out of the graph', () => {
  // An HPRC-shaped graph: the reference backbone is spelled GRCh38 in the graph
  // and loaded as hg38 in the session, and the alleles come from haplotypes that
  // are not assemblies at all.
  const HPRC_RGFA =
    'H\tVN:Z:1.0\n' +
    'S\t1\tACGTACGTAC\tSN:Z:GRCh38#0#chr6\tSO:i:31000000\tSR:i:0\n' +
    'S\t2\tACGTACGTAC\tSN:Z:GRCh38#0#chr6\tSO:i:31000010\tSR:i:0\n' +
    'S\t3\tTTTT\tSN:Z:HG02717#1#chr6\tSO:i:9000\tSR:i:1\n' +
    'L\t1\t+\t2\t+\t0M\nL\t1\t+\t3\t+\t0M\nL\t3\t+\t2\t+\t0M\n'

  // The one HPRC donor a session can load: CHM13, whose sequence is UCSC's `hs1`
  // and whose contigs are spelled the way GRCh38's are.
  const CHM13_RGFA =
    'H\tVN:Z:1.0\n' +
    'S\t1\tACGTACGTAC\tSN:Z:GRCh38#0#chr17\tSO:i:83022650\tSR:i:0\n' +
    'S\t2\tACGTACGTAC\tSN:Z:GRCh38#0#chr17\tSO:i:83022660\tSR:i:0\n' +
    'S\t3\tTTTT\tSN:Z:CHM13#0#chr17\tSO:i:83899576\tSR:i:61\n' +
    'L\t1\t+\t2\t+\t0M\nL\t1\t+\t3\t+\t0M\nL\t3\t+\t2\t+\t0M\n'

  // An E. coli-shaped graph: two strains, both loaded as assemblies.
  const ECOLI_RGFA =
    'H\tVN:Z:1.0\n' +
    'S\t1\tACGTACGTAC\tSN:Z:K12#1#chr\tSO:i:1000\tSR:i:0\n' +
    'S\t2\tACGTACGTAC\tSN:Z:K12#1#chr\tSO:i:1010\tSR:i:0\n' +
    'S\t3\tTTTT\tSN:Z:Sakai#1#chr\tSO:i:90000\tSR:i:1\n' +
    'L\t1\t+\t2\t+\t0M\nL\t1\t+\t3\t+\t0M\nL\t3\t+\t2\t+\t0M\n'

  const HPRC_REGION = {
    refName: 'chr6',
    assemblyName: 'hg38',
    start: 31000000,
    end: 31000020,
  }

  // `loadedGraph` mocks only `GetSubgraph`, so the background layout RPC these
  // tests don't care about rejects and logs — expected noise, not a signal.
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = []
    mockSession.assemblyNames = []
    mockSession.assemblyAliases = {}
    mockSession.views = []
    mockSession.addedViews = []
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  function launchLabels(model: { menuItems: () => unknown[] }) {
    const items = model.menuItems() as {
      label?: string
      subMenu?: { label?: string }[]
    }[]
    const launch = items.find(i => i.label === LAUNCH_LABEL)
    return (launch?.subMenu ?? []).map(i => i.label)
  }

  async function loadedGraph(gfa: string, region = HPRC_REGION) {
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? Promise.resolve(gfa)
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      loadedTrackId: 'rgfa-track',
    })
    await model.cutSubgraph({ type: 'RgfaTabixAdapter' }, region)
    return model
  }

  // The graph spells the reference GRCh38 and the session calls it hg38, so
  // resolving the backbone by its PanSN name would leave the graph with no way
  // out at all. The cut region names the assembly instead.
  test('the reference resolves through the cut region, not its stable name', async () => {
    mockSession.assemblyNames = ['hg38']
    const model = await loadedGraph(HPRC_RGFA)

    expect(model.contributingAssemblies.map(c => c.sample)).toEqual([
      'GRCh38',
      'HG02717',
    ])
    expect(model.launchableAssemblies).toEqual([
      expect.objectContaining({
        sample: 'hg38',
        refName: 'chr6',
        start: 31000000,
        end: 31000020,
        rank: 0,
      }),
    ])
    expect(launchLabels(model)).toEqual([
      'Linear genome view — hg38 chr6:31,000,001-31,000,020',
    ])
  })

  // 400-odd contributing haplotypes, one loaded assembly: a per-assembly menu
  // would be all dead items, and there is nothing to compare in a synteny view.
  test('unloaded haplotypes offer no synteny item', async () => {
    mockSession.assemblyNames = ['hg38']
    const model = await loadedGraph(HPRC_RGFA)
    expect(launchLabels(model)).not.toContain(
      'Linear synteny view (2 assemblies)',
    )
  })

  // A haplotype allele has an exact coordinate on a sequence nothing has loaded,
  // so the way back to a coordinate is the reference projection.
  test('an unloaded haplotype node still locates on the reference', async () => {
    mockSession.assemblyNames = ['hg38']
    const model = await loadedGraph(HPRC_RGFA)
    const { own, reference } = model.nodeLaunchTargets('3+')

    expect(own).toBeUndefined()
    expect(reference).toEqual({
      assembly: 'hg38',
      location: expect.objectContaining({ refName: 'chr6' }),
    })
  })

  // A donor is openable when the session has its sequence, whatever the session
  // calls it: the graph says CHM13, the assembly is `hs1` with CHM13 as an alias,
  // and the launch has to name `hs1` because that is what addView can open.
  test('a donor loaded under an alias is openable, under the assembly name', async () => {
    mockSession.assemblyNames = ['hg38', 'hs1']
    mockSession.assemblyAliases = { CHM13: 'hs1', GRCh38: 'hg38' }
    const model = await loadedGraph(CHM13_RGFA, {
      refName: 'chr17',
      assemblyName: 'hg38',
      start: 83022650,
      end: 83022670,
    })

    expect(model.launchableAssemblies.map(c => c.sample)).toEqual([
      'hg38',
      'hs1',
    ])
    expect(model.nodeLaunchTargets('3+').own).toEqual({
      assembly: 'hs1',
      location: expect.objectContaining({ refName: 'chr17' }),
    })
  })

  // The track's assemblyNameToPanSN already says which assembly a PanSN prefix
  // is, for its own features, so the graph cut from it reads the same map and
  // the assembly needs no alias restating it.
  test('a haplotype the track maps is openable with no alias', async () => {
    mockSession.assemblyNames = ['hg38', 'HG02717.1']
    mockSession.tracks = [
      {
        trackId: 'rgfa-track',
        adapter: {
          type: 'RgfaTabixAdapter',
          assemblyNameToPanSN: { hg38: 'GRCh38', 'HG02717.1': 'HG02717#1' },
        },
      },
    ]
    const model = await loadedGraph(HPRC_RGFA)

    expect(model.launchableAssemblies.map(c => c.sample)).toEqual([
      'hg38',
      'HG02717.1',
    ])
    expect(model.nodeLaunchTargets('3+').own).toEqual({
      assembly: 'HG02717.1',
      location: expect.objectContaining({ refName: 'chr6' }),
    })
  })

  // The same graph with no CHM13 assembly loaded: the donor node falls back to
  // the reference projection, which is the HPRC default.
  test('a donor with no assembly, aliased or otherwise, is not openable', async () => {
    mockSession.assemblyNames = ['hg38']
    const model = await loadedGraph(CHM13_RGFA, {
      refName: 'chr17',
      assemblyName: 'hg38',
      start: 83022650,
      end: 83022670,
    })

    expect(model.launchableAssemblies.map(c => c.sample)).toEqual(['hg38'])
    expect(model.nodeLaunchTargets('3+').own).toBeUndefined()
  })

  // Where every contributor is a loaded assembly the graph offers one panel per
  // strain, and a synteny view of all of them — the item is disabled while no
  // synteny track aligns them, rather than absent.
  // Sakai's allele is drawn bare unless Sakai's own annotation is read onto
  // it: the reference's genes only reach the backbone
  test("a loaded strain's own genes are read onto its nodes off the reference", async () => {
    mockSession.assemblyNames = ['K12', 'Sakai']
    mockSession.tracks = [
      {
        trackId: 'Sakai_genes',
        name: 'Sakai genes',
        assemblyNames: ['Sakai'],
        adapter: { type: 'Gff3TabixAdapter' },
      },
    ]
    const model = await loadedGraph(ECOLI_RGFA, {
      refName: 'chr',
      assemblyName: 'K12',
      start: 1000,
      end: 1020,
    })
    expect(model.ownGeneReads).toEqual([
      {
        stableRefName: 'Sakai#1#chr',
        trackId: 'Sakai_genes',
        region: {
          assemblyName: 'Sakai',
          refName: 'chr',
          start: 90000,
          end: 90004,
        },
      },
    ])
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'CoreGetFeatures'
        ? Promise.resolve([
            {
              name: 'stx2A',
              refName: 'chr',
              start: 90001,
              end: 90003,
              strand: 1,
              subfeatures: [{ type: 'exon', start: 90001, end: 90003 }],
            },
          ])
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    await model.loadOwnGenes()
    expect(model.ownGeneFeatures).toEqual([
      expect.objectContaining({
        name: 'stx2A · Sakai#1',
        refName: 'Sakai#1#chr',
        start: 90001,
        end: 90003,
      }),
    ])
  })

  test("a strain's gene read is aborted by the next read, clearGraph and destroy", async () => {
    mockSession.assemblyNames = ['K12', 'Sakai']
    mockSession.tracks = [
      {
        trackId: 'Sakai_genes',
        name: 'Sakai genes',
        assemblyNames: ['Sakai'],
        adapter: { type: 'Gff3TabixAdapter' },
      },
    ]
    const region = {
      refName: 'chr',
      assemblyName: 'K12',
      start: 1000,
      end: 1020,
    }
    const reads: { signal: AbortSignal; settle: (f: unknown[]) => void }[] = []
    async function readOwnGenes() {
      const model = await loadedGraph(ECOLI_RGFA, region)
      mockRpcCall.mockImplementation(
        (_sid: unknown, method: string, args: { signal: AbortSignal }) =>
          method === 'CoreGetFeatures'
            ? new Promise(resolve => {
                reads.push({ signal: args.signal, settle: resolve })
              })
            : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
      )
      return { model, read: model.loadOwnGenes() }
    }

    const { model, read } = await readOwnGenes()
    void model.loadOwnGenes()
    expect(reads).toHaveLength(2)
    expect(reads[0]!.signal.aborted).toBe(true)
    expect(reads[1]!.signal.aborted).toBe(false)
    reads[0]!.settle([])
    await read
    expect(model.ownGeneFeatures).toBeUndefined()

    model.clearGraph()
    expect(reads[1]!.signal.aborted).toBe(true)

    const next = await readOwnGenes()
    expect(reads[2]!.signal.aborted).toBe(false)
    destroy(next.model)
    expect(reads[2]!.signal.aborted).toBe(true)
  })

  test('loaded strains offer a per-strain linear view and a synteny item', async () => {
    mockSession.assemblyNames = ['K12', 'Sakai']
    const model = await loadedGraph(ECOLI_RGFA, {
      refName: 'chr',
      assemblyName: 'K12',
      start: 1000,
      end: 1020,
    })

    expect(model.launchableAssemblies.map(c => c.sample)).toEqual([
      'K12',
      'Sakai',
    ])
    expect(launchLabels(model)).toEqual([
      'Linear genome view',
      'Linear synteny view (2 assemblies)',
    ])
  })

  // The gesture is "show me this", not "give me another pane": a linear view
  // already on the assembly is the one that moves.
  test('showing a node moves the linear view beside the graph', async () => {
    mockSession.assemblyNames = ['hg38']
    const navToLocString = vi.fn()
    mockSession.views = [
      {
        id: 'lgv1',
        type: 'LinearGenomeView',
        assemblyNames: ['hg38'],
        navToLocString,
      },
    ]
    const model = await loadedGraph(HPRC_RGFA)
    const { reference } = model.nodeLaunchTargets('1+')
    model.showInLinearView(reference!)

    expect(navToLocString).toHaveBeenCalledWith(
      expect.stringContaining('chr6:'),
      'hg38',
    )
    expect(mockSession.addedViews).toEqual([])
    // and pairs with it, so the hover sync works both ways from here on
    expect(model.connectedViewId).toBe('lgv1')
  })

  test('with no linear view to move, one is opened carrying the graph track', async () => {
    mockSession.assemblyNames = ['hg38']
    mockSession.tracks = [TEST_TRACK]
    const model = await loadedGraph(HPRC_RGFA)
    const { reference } = model.nodeLaunchTargets('1+')
    model.showInLinearView(reference!)

    expect(mockSession.addedViews).toEqual([
      [
        'LinearGenomeView',
        expect.objectContaining({
          init: expect.objectContaining({
            assembly: 'hg38',
            tracks: ['rgfa-track'],
          }),
        }),
      ],
    ])
    expect(model.connectedViewId).toBe('view-1')
  })

  test('an opened view carries one gene track, not every feature track', async () => {
    mockSession.assemblyNames = ['hg38']
    const feature = (trackId: string, name: string, type: string) => ({
      trackId,
      name,
      type: 'FeatureTrack',
      assemblyNames: ['hg38'],
      adapter: { type },
    })
    mockSession.tracks = [
      feature('rgfa-track', 'graph', 'RgfaTabixAdapter'),
      feature('clinvar', 'ClinVar', 'BigBedAdapter'),
      feature('ncbi', 'NCBI RefSeq genes', 'Gff3TabixAdapter'),
      feature('gwas', 'GWAS catalog', 'BedTabixAdapter'),
    ]
    const model = await loadedGraph(HPRC_RGFA)
    const { reference } = model.nodeLaunchTargets('1+')
    model.showInLinearView(reference!)

    expect(mockSession.addedViews).toEqual([
      [
        'LinearGenomeView',
        expect.objectContaining({
          init: expect.objectContaining({ tracks: ['rgfa-track', 'ncbi'] }),
        }),
      ],
    ])
  })

  // a BED named for no annotation is not picked as genes, but beats `No
  // tracks active`
  test('a strain with no gene-looking track opens on its first feature track', async () => {
    mockSession.assemblyNames = ['K12', 'Sakai']
    mockSession.tracks = [
      {
        trackId: 'Sakai_segments',
        name: 'Sakai segments',
        type: 'FeatureTrack',
        assemblyNames: ['Sakai'],
        adapter: { type: 'BedAdapter' },
      },
    ]
    const model = await loadedGraph(ECOLI_RGFA, {
      refName: 'chr',
      assemblyName: 'K12',
      start: 1000,
      end: 1020,
    })
    model.showInLinearView(model.nodeLaunchTargets('3+').own!)
    expect(mockSession.addedViews).toEqual([
      [
        'LinearGenomeView',
        expect.objectContaining({
          init: expect.objectContaining({
            assembly: 'Sakai',
            tracks: ['Sakai_segments'],
          }),
        }),
      ],
    ])
  })

  // A pairing is not stolen from a view still on screen: a graph launched from
  // a linear view came in on that sync. One whose view has been closed is held
  // by nothing, and kept, the view the graph opens next never got its hover.
  test('a pairing with a view that has been closed is given to the next one opened', async () => {
    mockSession.assemblyNames = ['hg38']
    const model = await loadedGraph(HPRC_RGFA)
    applySnapshot(model, { ...getSnapshot(model), connectedViewId: 'closed' })
    const { reference } = model.nodeLaunchTargets('1+')
    model.showInLinearView(reference!)

    expect(mockSession.addedViews).toHaveLength(1)
    expect(model.connectedViewId).toBe('view-1')
  })

  test('a pairing with a view still open is kept', async () => {
    mockSession.assemblyNames = ['hg38']
    mockSession.views = [
      {
        id: 'lgv1',
        type: 'LinearGenomeView',
        assemblyNames: ['hg38'],
        navToLocString: vi.fn(),
      },
      {
        id: 'lgv2',
        type: 'LinearGenomeView',
        assemblyNames: ['hg38'],
        navToLocString: vi.fn(),
      },
    ]
    const model = await loadedGraph(HPRC_RGFA)
    applySnapshot(model, { ...getSnapshot(model), connectedViewId: 'lgv2' })
    const { reference } = model.nodeLaunchTargets('1+')
    model.showInLinearView(reference!)

    expect(model.connectedViewId).toBe('lgv2')
  })

  // A view opened on a node is padded so the node has context around it; a
  // mark of the node is not, or a short node paints a band several times its
  // own width where its hover band is exact.
  test("a node's highlight is its own span, the span its hover band draws", async () => {
    mockSession.assemblyNames = ['hg38']
    const model = await loadedGraph(HPRC_RGFA)
    const { reference, highlight } = model.nodeLaunchTargets('1+')
    model.setHoveredNode('1+')
    const hover = model.hoverHighlight!

    expect(highlight!.assembly).toBe('hg38')
    expect(highlight!.location).toMatchObject({
      refName: hover.refName,
      start: hover.start,
      end: hover.end,
    })
    const width = (loc: { start: number; end: number }) => loc.end - loc.start
    expect(width(reference!.location)).toBeGreaterThan(
      width(highlight!.location),
    )
  })

  // A node's hover band is on the assembly the graph was cut against. Paired
  // with a view on any other, the band fails that view's assembly check and
  // the reference view's id check, and is drawn nowhere.
  test('opening a contributor other than the reference leaves the graph unpaired', async () => {
    mockSession.assemblyNames = ['K12', 'Sakai']
    const model = await loadedGraph(ECOLI_RGFA, {
      refName: 'chr',
      assemblyName: 'K12',
      start: 1000,
      end: 1020,
    })
    const sakai = model.launchableAssemblies.find(c => c.sample === 'Sakai')!
    model.showInLinearView({ location: sakai, assembly: sakai.sample })

    expect(mockSession.addedViews).toHaveLength(1)
    expect(model.connectedViewId).toBeUndefined()
  })
})

// GRCh38 and CHM13 walk chr6 at overlapping coordinates, so hg38's HLA-A lies
// over segment 1 whichever walk x is drawn along. Only GRCh38's is hg38's.
describe('genes on a backbone of another assembly', () => {
  const SEGMENTS = [
    'S\t1\tAAAAAAAAAA',
    'S\t2\tCCCCCCCCCC',
    'S\t3\tGGGGGGGGGG',
    'S\t4\tTTTTTTTTTT',
    'L\t1\t+\t2\t+\t0M',
    'L\t1\t+\t3\t+\t0M',
    'L\t2\t+\t4\t+\t0M',
    'L\t3\t+\t4\t+\t0M',
  ]
  // A gbz-base cut writes the track's reference walk first
  const gfaOf = (...walks: string[]) => [...SEGMENTS, ...walks, ''].join('\n')
  const GRCH38 = 'W\tGRCh38\t0\tchr6\t1000\t1030\t>1>2>4'
  const CHM13 = 'W\tCHM13\t0\tchr6\t1005\t1035\t>1>3>4'
  const CHR6_WALKS = gfaOf(GRCH38, CHM13)
  // The same alleles named the way an older graph does, with no PanSN prefix to
  // say whose chr6 each is
  const BARE_CHR6_PATHS = gfaOf(
    'P\tchr6:1000-1030\t1+,2+,4+\t*',
    'P\tCHM13_chr6:1005-1035\t1+,3+,4+\t*',
  )
  const BARE_CHR6_RGFA = [
    'S\t1\tAAAAAAAAAA\tSN:Z:chr6\tSO:i:1000\tSR:i:0',
    'S\t2\tCCCCCCCCCC\tSN:Z:chr6\tSO:i:1010\tSR:i:0',
    'S\t3\tGGGGGGGGGG\tSN:Z:CHM13_chr6\tSO:i:1015\tSR:i:1',
    'S\t4\tTTTTTTTTTT\tSN:Z:chr6\tSO:i:1020\tSR:i:0',
    ...SEGMENTS.filter(line => line.startsWith('L')),
    '',
  ].join('\n')
  // chr6 bp that only GRCh38's walk covers, only CHM13's, and both
  const ON_GRCH38 = { start: 1000, end: 1004 }
  const ON_CHM13 = { start: 1031, end: 1034 }
  const ON_BOTH = { start: 1012, end: 1018 }

  let gfa = CHR6_WALKS
  let geneAt = { refName: 'chr6', start: 1002, end: 1008 }
  const bySlot = (obj: Record<string, unknown>, key?: unknown) =>
    obj[String(key)]
  const adapterOnly = (obj: Record<string, unknown>, key?: unknown) =>
    key === 'adapter' ? obj.adapter : undefined

  function sessionWith(assemblyName: string, graphAdapter = {}) {
    mockSession.tracks = [
      { trackId: 'graph', assemblyNames: [], adapter: graphAdapter },
      {
        trackId: 'refseq',
        name: 'RefSeq genes',
        assemblyNames: [assemblyName],
        adapter: { type: 'Gff3TabixAdapter' },
      },
    ]
  }

  beforeEach(() => {
    vi.mocked(readConfObject).mockImplementation(bySlot)
    sessionWith('hg38')
    gfa = CHR6_WALKS
    geneAt = { refName: 'chr6', start: 1002, end: 1008 }
    mockRpcCall.mockReset()
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? Promise.resolve(gfa)
        : method === 'CoreGetFeatures'
          ? Promise.resolve([{ type: 'gene', name: 'HLA-A', ...geneAt }])
          : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
  })

  afterEach(() => {
    vi.mocked(readConfObject).mockImplementation(adapterOnly)
    mockSession.tracks = []
    mockSession.assemblyNames = []
    mockSession.assemblyAliases = {}
  })

  async function cutFor(
    assemblyName: string,
    layoutMode: LayoutModeValue = 'auto',
  ) {
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode,
      loadedTrackId: 'graph',
    })
    await model.cutSubgraph(
      {},
      { refName: geneAt.refName, assemblyName, start: 1000, end: 1035 },
    )
    return model
  }

  type Model = Awaited<ReturnType<typeof cutFor>>
  const pinned = (model: Model) => model.genePins.map(p => p.gene.name)
  const tubeMapped = (model: Model) => model.tubeMapGenes.map(g => g.gene.name)

  async function drawAlong(model: Model, path: string) {
    model.setReferencePath(path)
    await model.recomputeLayout()
    expect(model.activeReferencePath).toBe(path)
  }

  test.each([
    ['auto', pinned],
    ['tubemapref', tubeMapped],
  ] as const)(
    '%s draws hg38 genes only while x is drawn along the GRCh38 walk',
    async (layoutMode, drawn) => {
      const model = await cutFor('hg38', layoutMode)
      expect(model.activeReferencePath).toBe('GRCh38#0#chr6')
      expect(drawn(model)).toEqual(['HLA-A'])

      await drawAlong(model, 'CHM13#0#chr6')
      expect(model.geneFeatures).toHaveLength(1)
      expect(drawn(model)).toEqual([])

      await drawAlong(model, 'GRCh38#0#chr6')
      expect(drawn(model)).toEqual(['HLA-A'])
    },
  )

  test('an assembly’s session aliases or PanSN prefix put x on its walk', async () => {
    gfa = gfaOf(CHM13, GRCH38)
    geneAt = { refName: 'chr6', ...ON_GRCH38 }
    sessionWith('mine')
    const unnamed = await cutFor('mine')
    expect(unnamed.activeReferencePath).toBe('CHM13#0#chr6')
    expect(pinned(unnamed)).toEqual([])

    mockSession.assemblyNames = ['mine']
    mockSession.assemblyAliases = { GRCh38: 'mine' }
    expect(pinned(await cutFor('mine'))).toEqual(['HLA-A'])

    mockSession.assemblyAliases = {}
    sessionWith('mine', { assemblyNameToPanSN: { mine: 'GRCh38#0' } })
    expect(pinned(await cutFor('mine'))).toEqual(['HLA-A'])
  })

  test('an assemblyNameToPanSN keyed by a session alias puts x on its walk', async () => {
    gfa = gfaOf(CHM13, GRCH38)
    geneAt = { refName: 'chr6', ...ON_GRCH38 }
    mockSession.assemblyNames = ['mine']
    mockSession.assemblyAliases = { 'GRCh38.p14': 'mine' }
    sessionWith('mine', { assemblyNameToPanSN: { 'GRCh38.p14': 'GRCh38#0' } })
    const model = await cutFor('mine')
    expect(model.activeReferencePath).toBe('GRCh38#0#chr6')
    expect(pinned(model)).toEqual(['HLA-A'])
  })

  // gbz-base writes a reference path that names no sample as `_gbwt_ref`
  test('a vg graph’s generic reference takes its track’s genes', async () => {
    gfa = gfaOf(
      'W\t_gbwt_ref\t0\tchr6\t1000\t1030\t>1>2>4',
      'W\tHG002\t1\tchr6\t1005\t1035\t>1>3>4',
    )
    const model = await cutFor('hg38')
    expect(model.activeReferencePath).toBe('_gbwt_ref#0#chr6')
    expect(pinned(model)).toEqual(['HLA-A'])

    await drawAlong(model, 'HG002#1#chr6')
    expect(pinned(model)).toEqual([])

    await drawAlong(model, '_gbwt_ref#0#chr6')
    expect(pinned(model)).toEqual(['HLA-A'])
  })

  // The adapter cuts along its referenceSample, else along the database's only
  // reference sample, and names neither after the assembly
  test.each([
    [
      'the referenceSample slot',
      'T2T-CHM13v2.0',
      { type: 'GbzBaseSyntenyAdapter', referenceSample: 'CHM13' },
      gfaOf(CHM13, GRCH38),
      { refName: 'chr6', ...ON_CHM13 },
    ],
    [
      'the only reference sample',
      'mm39',
      { type: 'GbzBaseSyntenyAdapter' },
      gfaOf(
        'W\tC57BL_6J\t0\tchr17\t1000\t1030\t>1>2>4',
        'W\tDBA_2J\t1\tchr17\t1005\t1035\t>1>3>4',
      ),
      { refName: 'chr17', ...ON_GRCH38 },
    ],
  ])(
    'the walk a GBZ track cuts along with %s takes its genes',
    async (_how, assemblyName, adapter, walks, at) => {
      gfa = walks
      geneAt = at
      sessionWith(assemblyName, adapter)
      const model = await cutFor(assemblyName)
      expect(pinned(model)).toEqual(['HLA-A'])
    },
  )

  test('a re-cut keeps the genes off a walk the user drew x along', async () => {
    gfa = gfaOf(CHM13, GRCH38)
    geneAt = { refName: 'chr6', ...ON_BOTH }
    sessionWith('T2T-CHM13v2.0', {
      type: 'GbzBaseSyntenyAdapter',
      referenceSample: 'CHM13',
    })
    const model = await cutFor('T2T-CHM13v2.0')
    expect(pinned(model)).toEqual(['HLA-A'])

    await drawAlong(model, 'GRCh38#0#chr6')
    expect(pinned(model)).toEqual([])

    const region = model.graphRegion
    await model.cutSubgraph(
      {},
      {
        refName: 'chr6',
        assemblyName: 'T2T-CHM13v2.0',
        start: 1005,
        end: 1035,
      },
    )
    expect(model.graphRegion).not.toBe(region)
    expect(model.activeReferencePath).toBe('GRCh38#0#chr6')
    expect(pinned(model)).toEqual([])

    await drawAlong(model, 'CHM13#0#chr6')
    expect(pinned(model)).toEqual(['HLA-A'])
  })

  test('a diploid’s sample-level name leaves the other haplotype bare', async () => {
    gfa = gfaOf(
      'W\tHG002\t1\tchr6\t1000\t1030\t>1>2>4',
      'W\tHG002\t2\tchr6\t1000\t1030\t>1>3>4',
    )
    sessionWith('HG002.1', { assemblyNameToPanSN: { 'HG002.1': 'HG002' } })
    const model = await cutFor('HG002.1')
    expect(model.activeReferencePath).toBe('HG002#1#chr6')
    expect(pinned(model)).toEqual(['HLA-A'])

    await drawAlong(model, 'HG002#2#chr6')
    expect(pinned(model)).toEqual([])
  })

  test('a bare rGFA takes the assembly its track puts it on', async () => {
    gfa = BARE_CHR6_RGFA
    const model = await cutFor('hg38')
    expect(pinned(model)).toEqual(['HLA-A'])

    model.setReferencePath('CHM13_chr6')
    await model.recomputeLayout()
    expect(pinned(model)).toEqual(['HLA-A'])
  })

  test('a bare path graph takes it only along the path it came with', async () => {
    gfa = BARE_CHR6_PATHS
    const model = await cutFor('hg38')
    expect(model.activeReferencePath).toBe('chr6')
    expect(pinned(model)).toEqual(['HLA-A'])

    await drawAlong(model, 'CHM13_chr6')
    expect(model.geneFeatures).toHaveLength(1)
    expect(model.backboneGenes).toBeUndefined()
    expect(pinned(model)).toEqual([])

    await drawAlong(model, 'chr6')
    expect(pinned(model)).toEqual(['HLA-A'])
  })
})
