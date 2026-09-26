import { expect, test, vi } from 'vitest'

import { graphLaunchMenuItems } from './graphMenuItems'
import {
  highlightInLinearView,
  launchSyntenyView,
  showInLinearView,
} from './launchFromGraph'

import type { Contributor } from './contributors'
import type { GraphLaunchSession } from './launchFromGraph'
import type { MenuItem } from '@jbrowse/core/ui'

function contributor(sample: string, rank: number, start = 1000): Contributor {
  return {
    sample,
    refName: 'chr',
    start,
    end: start + 5000,
    rank,
    nodeCount: 3,
  }
}

// Plain objects rather than config models: readConfObject returns a non-MST
// object's own fields unchanged, so this exercises the same read path.
function track(props: Record<string, unknown>) {
  return props as never
}

function testSession(views: unknown[] = [], tracks = [] as never[]) {
  const added: [string, Record<string, unknown> | undefined][] = []
  const session = {
    tracks,
    assemblies: [],
    assemblyNames: ['K12', 'Sakai'],
    views,
    addView: (type: string, snapshot?: Record<string, unknown>) => {
      added.push([type, snapshot])
      return { id: `view-${added.length}` }
    },
  }
  // The launch functions read only these members, which is why they are typed
  // structurally rather than against AbstractSessionModel.
  return { session: session satisfies GraphLaunchSession, added }
}

function linearView(id: string, assemblyNames: string[]) {
  return {
    id,
    type: 'LinearGenomeView',
    assemblyNames,
    navToLocString: vi.fn(),
    addToHighlights: vi.fn(),
  }
}

const K12_LOCATION = {
  sample: 'K12',
  refName: 'chr',
  start: 1000,
  end: 6000,
}

// The point of the whole feature: the graph moves the linear view beside it
// rather than stacking another pane on top of it.
test('an existing linear view on the assembly is navigated, not duplicated', () => {
  const view = linearView('lgv1', ['K12'])
  const { session, added } = testSession([view])

  const viewId = showInLinearView({
    session,
    location: K12_LOCATION,
    assembly: 'K12',
    connectedViewId: undefined,
  })

  expect(view.navToLocString).toHaveBeenCalledWith('chr:1001-6000', 'K12')
  expect(added).toEqual([])
  expect(viewId).toBe('lgv1')
})

test('the paired view wins over another view on the same assembly', () => {
  const paired = linearView('lgv2', ['K12'])
  const other = linearView('lgv1', ['K12'])
  const { session } = testSession([other, paired])

  showInLinearView({
    session,
    location: K12_LOCATION,
    assembly: 'K12',
    connectedViewId: 'lgv2',
  })

  expect(paired.navToLocString).toHaveBeenCalled()
  expect(other.navToLocString).not.toHaveBeenCalled()
})

// Ambiguous and unpaired: scrolling one of the user's several views is a guess,
// so a view we own is opened instead. The graph's own track goes on it.
test('two candidate views and no pairing opens a new view', () => {
  const { session, added } = testSession([
    linearView('lgv1', ['K12']),
    linearView('lgv2', ['K12']),
  ])

  showInLinearView({
    session,
    location: K12_LOCATION,
    assembly: 'K12',
    connectedViewId: undefined,
    tracks: ['graph_segments'],
  })

  expect(added).toEqual([
    [
      'LinearGenomeView',
      {
        displayName: 'K12 — chr:1,001-6,000',
        init: {
          assembly: 'K12',
          loc: 'chr:1001-6000',
          tracks: ['graph_segments'],
        },
      },
    ],
  ])
})

// The view on screen can refuse a location, a contig it has no alias for say.
// Its promise was let go, so the click moved nothing and said nothing, where
// the same click with no view open reports the failure through the new view.
test('a view that cannot go where it is sent says so', async () => {
  const view = linearView('lgv1', ['K12'])
  view.navToLocString.mockRejectedValue(new Error('No results found'))
  const { session } = testSession([view])
  const notifyError = vi.fn()

  showInLinearView({
    session: { ...session, notifyError },
    location: K12_LOCATION,
    assembly: 'K12',
  })
  await vi.waitFor(() => {
    expect(notifyError).toHaveBeenCalledWith(
      expect.stringContaining('chr:1,001-6,000'),
      expect.objectContaining({ message: 'No results found' }),
    )
  })
})

test('a linear view on another assembly is not navigated', () => {
  const view = linearView('lgv1', ['Sakai'])
  const { session, added } = testSession([view])

  showInLinearView({ session, location: K12_LOCATION, assembly: 'K12' })

  expect(view.navToLocString).not.toHaveBeenCalled()
  expect(added).toHaveLength(1)
})

// The panel loci come from the graph itself, so no mate discovery, no PAF
// lookup and no dialog stand between the graph and a multi-genome view.
test('a synteny launch frames each panel on its own assembly coordinates', () => {
  const { session, added } = testSession()

  launchSyntenyView({
    session,
    contributors: [contributor('K12', 0), contributor('Sakai', 1, 90000)],
    trackId: 'ecoli_ava',
  })

  expect(added[0]).toEqual([
    'LinearSyntenyView',
    {
      init: {
        views: [
          { assembly: 'K12', loc: 'chr:1001-6000' },
          { assembly: 'Sakai', loc: 'chr:90001-95000' },
        ],
        tracks: [['ecoli_ava']],
        collapseEmptyRows: true,
      },
    },
  ])
})

// `init.tracks` is per LEVEL, and a flat list is read as the level-0 shorthand,
// so this is what a launch with more than two panels used to get wrong: the top
// band drew ribbons and every band under it opened as a bare ruler.
test('a synteny launch puts the alignment on every level, not just the first', () => {
  const { session, added } = testSession()

  launchSyntenyView({
    session,
    contributors: [
      contributor('K12', 0),
      contributor('Sakai', 1, 90000),
      contributor('CFT073', 2, 40000),
      contributor('IAI39', 3, 20000),
    ],
    trackId: 'ecoli_ava',
  })

  expect(added[0]).toEqual([
    'LinearSyntenyView',
    {
      init: {
        views: [
          { assembly: 'K12', loc: 'chr:1001-6000' },
          { assembly: 'Sakai', loc: 'chr:90001-95000' },
          { assembly: 'CFT073', loc: 'chr:40001-45000' },
          { assembly: 'IAI39', loc: 'chr:20001-25000' },
        ],
        tracks: [['ecoli_ava'], ['ecoli_ava'], ['ecoli_ava']],
        collapseEmptyRows: true,
      },
    },
  ])
})

// A track aligning two of five strains is offered, since two is a synteny view.
// Opened over all five it sat on four levels and could draw on at most one, and
// only if its two strains happened to be neighbours: K12 and CFT073 are not,
// so every band opened empty.
test('a synteny launch opens the panels the chosen track aligns', () => {
  const { session, added } = testSession(
    [],
    [
      track({
        type: 'SyntenyTrack',
        trackId: 'k12_cft073',
        assemblyNames: ['CFT073', 'K12'],
      }),
    ],
  )

  launchSyntenyView({
    session,
    contributors: [
      contributor('K12', 0),
      contributor('Sakai', 1, 90000),
      contributor('CFT073', 2, 40000),
      contributor('IAI39', 3, 20000),
    ],
    trackId: 'k12_cft073',
  })

  expect(added[0]?.[1]?.init).toEqual({
    views: [
      { assembly: 'K12', loc: 'chr:1001-6000' },
      { assembly: 'CFT073', loc: 'chr:40001-45000' },
    ],
    tracks: [['k12_cft073']],
    collapseEmptyRows: true,
  })
})

function labels(items: MenuItem[]) {
  return items.flatMap(i => ('label' in i ? [i.label] : []))
}

test('one contributor offers a linear view and no synteny item', () => {
  const items = graphLaunchMenuItems({
    contributors: [contributor('GRCh38', 0)],
    syntenyTracks: [],
    onShowLinear: () => {},
    onShowSynteny: () => {},
  })
  expect(labels(items)).toEqual(['Linear genome view — GRCh38 chr:1,001-6,000'])
})

// Disabled rather than absent: an item that vanishes teaches nobody that the
// session is one synteny track short of a multi-genome view.
test('several contributors with no synteny track offer a disabled item', () => {
  const items = graphLaunchMenuItems({
    contributors: [contributor('K12', 0), contributor('Sakai', 1)],
    syntenyTracks: [],
    onShowLinear: () => {},
    onShowSynteny: () => {},
  })
  const synteny = items.find(
    i => 'label' in i && i.label === 'Linear synteny view (2 assemblies)',
  )
  expect(synteny).toMatchObject({ disabled: true })
})

// The lone track's name is left off: it is the ingredient, not the
// destination, and `pggb graph: all-vs-all synteny (wfmash)` is most of a menu
// wide. Several tracks do become a submenu naming each, since which alignment
// the ribbons come from is then a real choice.
test('several contributors and a synteny track launch it', () => {
  const onShowSynteny = vi.fn()
  const items = graphLaunchMenuItems({
    contributors: [contributor('K12', 0), contributor('Sakai', 1)],
    syntenyTracks: [{ trackId: 'ecoli_ava', name: 'All vs all', coverage: 2 }],
    onShowLinear: () => {},
    onShowSynteny,
  })
  const item = items.find(
    i => 'label' in i && i.label === 'Linear synteny view (2 assemblies)',
  )
  if (item && 'onClick' in item) {
    item.onClick(undefined)
  }
  expect(onShowSynteny).toHaveBeenCalledWith('ecoli_ava')
})

// The item counts the panels the launch opens, which is what its track aligns.
// Five strains and one pairwise track read "(5 assemblies)" and opened two.
test('the synteny item counts the assemblies its track aligns', () => {
  const five = ['K12', 'Sakai', 'CFT073', 'IAI39', 'NCTC86'].map((s, i) =>
    contributor(s, i),
  )
  const menu = (syntenyTracks: { name: string; coverage: number }[]) =>
    graphLaunchMenuItems({
      contributors: five,
      syntenyTracks: syntenyTracks.map(t => ({ ...t, trackId: t.name })),
      onShowLinear: () => {},
      onShowSynteny: () => {},
    }).at(-1)

  expect(menu([{ name: 'K12 vs Sakai', coverage: 2 }])).toMatchObject({
    label: 'Linear synteny view (2 assemblies)',
  })
  expect(
    menu([
      { name: 'All vs all', coverage: 5 },
      { name: 'K12 vs Sakai', coverage: 2 },
    ]),
  ).toMatchObject({
    label: 'Linear synteny view (5 assemblies)',
    subMenu: [{ label: 'All vs all' }, { label: 'K12 vs Sakai (2 of 5)' }],
  })
})

// The other direction of "where is this node": mark it in place rather than
// scroll to it, which is the half that survives a screenshot.
test('highlighting marks the view beside the graph and moves nothing', () => {
  const view = linearView('lgv1', ['K12'])
  const { session, added } = testSession([view])

  const marked = highlightInLinearView({
    session,
    location: K12_LOCATION,
    assembly: 'K12',
    connectedViewId: undefined,
  })

  expect(marked).toBe(true)
  expect(view.addToHighlights).toHaveBeenCalledWith({
    refName: 'chr',
    start: 1000,
    end: 6000,
    assemblyName: 'K12',
  })
  expect(view.navToLocString).not.toHaveBeenCalled()
  expect(added).toEqual([])
})

// Nothing to mark opens nothing: a highlight with no view to draw it in is the
// one case where the menu item should not have been offered at all.
test('highlighting with no linear view on the assembly does nothing', () => {
  const { session, added } = testSession([linearView('lgv1', ['Sakai'])])

  expect(
    highlightInLinearView({
      session,
      location: K12_LOCATION,
      assembly: 'K12',
      connectedViewId: undefined,
    }),
  ).toBe(false)
  expect(added).toEqual([])
})

// The graph's own track is what makes the band readable: without it the panels
// are bare rulers and the ribbons connect nothing a reader can match across.
test('a synteny launch carries the graph track into the panels it covers', () => {
  const { session, added } = testSession(
    [],
    [
      track({
        type: 'FeatureTrack',
        trackId: 'hprc_minigraph_segments',
        assemblyNames: ['hg38', 'hs1'],
      }),
    ],
  )

  launchSyntenyView({
    session,
    contributors: [contributor('hg38', 0), contributor('hs1', 1, 90000)],
    trackId: 'hg38_hs1_synteny',
    graphTrackId: 'hprc_minigraph_segments',
  })

  expect((added[0]?.[1]?.init as { views: unknown[] }).views).toEqual([
    {
      assembly: 'hg38',
      loc: 'chr:1001-6000',
      tracks: ['hprc_minigraph_segments'],
    },
    {
      assembly: 'hs1',
      loc: 'chr:90001-95000',
      tracks: ['hprc_minigraph_segments'],
    },
  ])
})

// The narrow rule is what keeps the five-strain launch from filling with lanes:
// the E. coli graph track names K12 alone, so four panels stay rulers.
test('a synteny launch leaves out panels the graph track does not cover', () => {
  const { session, added } = testSession(
    [],
    [
      track({
        type: 'FeatureTrack',
        trackId: 'ecoli_minigraph_segments',
        assemblyNames: ['K12'],
      }),
    ],
  )

  launchSyntenyView({
    session,
    contributors: [
      contributor('K12', 0),
      contributor('Sakai', 1, 90000),
      contributor('CFT073', 2, 40000),
    ],
    trackId: 'ecoli_ava',
    graphTrackId: 'ecoli_minigraph_segments',
  })

  expect((added[0]?.[1]?.init as { views: unknown[] }).views).toEqual([
    {
      assembly: 'K12',
      loc: 'chr:1001-6000',
      tracks: ['ecoli_minigraph_segments'],
    },
    { assembly: 'Sakai', loc: 'chr:90001-95000' },
    { assembly: 'CFT073', loc: 'chr:40001-45000' },
  ])
})

// A trackId the session no longer holds drops the lane rather than adding one
// the panel would fail to load.
test('a synteny launch ignores a graph track the session does not hold', () => {
  const { session, added } = testSession()

  launchSyntenyView({
    session,
    contributors: [contributor('K12', 0), contributor('Sakai', 1, 90000)],
    trackId: 'ecoli_ava',
    graphTrackId: 'gone',
  })

  expect((added[0]?.[1]?.init as { views: unknown[] }).views).toEqual([
    { assembly: 'K12', loc: 'chr:1001-6000' },
    { assembly: 'Sakai', loc: 'chr:90001-95000' },
  ])
})

// JBrowse 4 registers LinearSyntenyView's state model lazily and addView throws
// until it is loaded, which broke every synteny launch out of the graph; the
// session's launchView loads it first, and an older core without one still
// gets addView.
test('a synteny launch goes through launchView where the session has it', async () => {
  const { session, added } = testSession()
  const launched: [string, Record<string, unknown> | undefined][] = []
  launchSyntenyView({
    session: {
      ...session,
      launchView: (type: string, snapshot?: Record<string, unknown>) => {
        launched.push([type, snapshot])
        return Promise.resolve({ id: 'lazy-1' })
      },
    },
    contributors: [
      { ...K12_LOCATION, rank: 0, nodeCount: 1 },
      { ...K12_LOCATION, sample: 'Sakai', rank: 1, nodeCount: 1 },
    ],
    trackId: 'ava',
  })
  expect(launched.map(([type]) => type)).toEqual(['LinearSyntenyView'])
  expect(added).toEqual([])
})
