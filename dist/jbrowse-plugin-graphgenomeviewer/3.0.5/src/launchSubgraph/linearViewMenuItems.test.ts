// LAUNCH_LABEL rather than the literal: the host renamed this submenu from
// "Launch view" to "Launch" (packages/core/src/ui/launchViewMenu.ts says why),
// and a hardcoded copy here fails as "the item was never added" rather than as
// "the submenu is called something else".
import { LAUNCH_LABEL } from '@jbrowse/core/ui'

import { createTestEnvironment } from './testEnv'
import { MAX_GRAPH_REGION_BP } from '../GraphGenomeView/model'

import type { MenuItem } from '@jbrowse/core/ui'

const LABEL_VISIBLE = 'Graph genome view (this region)'
const LABEL_SELECTION = 'Graph genome view (this selection)'
const LABEL_FEATURE = 'Graph genome view (this feature)'

function launchItems(items: MenuItem[]) {
  const item = items.find(i => 'label' in i && i.label === LAUNCH_LABEL)
  return item && 'subMenu' in item ? item.subMenu : []
}

function find(items: MenuItem[], label: string) {
  return items.find(i => 'label' in i && i.label === label)
}

function click(item: MenuItem | undefined) {
  if (item && 'onClick' in item) {
    item.onClick(undefined)
  } else {
    throw new Error('menu item has no onClick')
  }
}

// A rubberband selection is the entry point that works at the zoom people
// actually browse at: the visible region is routinely wider than the cap, and
// selecting a range needs no navigating first.
test('the rubberband menu launches the selected range', () => {
  const { createDisplay } = createTestEnvironment()
  const { session, view } = createDisplay()
  view.setOffsets(
    { refName: 'ctgA', index: 0, offset: 1000, start: 0, end: 50_000 },
    { refName: 'ctgA', index: 0, offset: 2000, start: 0, end: 50_000 },
  )

  const item = find(view.rubberBandMenuItems(), LABEL_SELECTION)
  expect(item).toBeDefined()
  click(item)

  const [type, snapshot] = session.addedViews[0]!
  expect(type).toBe('GraphGenomeView')
  expect(snapshot.loadedTrackId).toBe('graph_track')
  expect(snapshot.connectedViewId).toBe(view.id)
  expect(snapshot.loadedRegion).toMatchObject({ refName: 'ctgA' })
})

test('the rubberband menu keeps the items it already had', () => {
  const { createDisplay } = createTestEnvironment()
  const { view } = createDisplay()
  view.setOffsets(
    { refName: 'ctgA', index: 0, offset: 1000, start: 0, end: 50_000 },
    { refName: 'ctgA', index: 0, offset: 2000, start: 0, end: 50_000 },
  )
  const labels = view
    .rubberBandMenuItems()
    .flatMap((i: MenuItem) => ('label' in i ? [i.label] : []))
  expect(labels).toContain('Zoom to region')
  expect(labels).toContain(LABEL_SELECTION)
})

// Nothing selected is not a launchable region, so the item stays out of the menu
// rather than appearing dead.
test('no rubberband selection adds no item', () => {
  const { createDisplay } = createTestEnvironment()
  const { view } = createDisplay()
  expect(find(view.rubberBandMenuItems(), LABEL_SELECTION)).toBeUndefined()
})

// The point of the view-level item: the graph track need not be the one whose
// menu you opened, or be open at all.
test('the view menu launches the visible region', () => {
  const { createDisplay } = createTestEnvironment()
  const { session, view } = createDisplay({ trackId: 'bubble_track' })

  const item = find(launchItems(view.menuItems()), LABEL_VISIBLE)
  expect(item).toBeDefined()
  click(item)

  expect(session.addedViews[0]![1].loadedTrackId).toBe('graph_track')
})

// A vanishing item teaches nothing; a greyed-out one with the size in its
// tooltip says what to do about it.
test('an over-cap region disables the item instead of hiding it', () => {
  const { createDisplay } = createTestEnvironment()
  const { session, view } = createDisplay()
  view.setDisplayedRegions([
    {
      assemblyName: 'volvox',
      refName: 'ctgA',
      start: 0,
      end: MAX_GRAPH_REGION_BP * 3,
    },
  ])
  // the *visible* span is what's cut, so it has to be zoomed out past the cap,
  // not merely have a large region loaded
  view.showAllRegions()
  expect(view.dynamicBlocks.totalBp).toBeGreaterThan(MAX_GRAPH_REGION_BP)

  const item = find(launchItems(view.menuItems()), LABEL_VISIBLE)
  expect(item).toMatchObject({ disabled: true })
  expect(item && 'disabledHelpText' in item && item.disabledHelpText).toMatch(
    /zoom in or select a smaller range/i,
  )
  expect(session.addedViews).toHaveLength(0)
})

// A graph is cut on its reference, the first assembly its track names, so a
// view of another one gets the reason rather than a cut in the wrong frame.
test('a view of a non-reference assembly disables the item and names the reference', () => {
  const { createDisplay } = createTestEnvironment({
    graphAssemblyNames: ['hg38', 'volvox'],
  })
  const { session, view } = createDisplay()
  const item = find(launchItems(view.menuItems()), LABEL_VISIBLE)
  expect(item).toMatchObject({ disabled: true })
  expect(item && 'disabledHelpText' in item && item.disabledHelpText).toMatch(
    /cut on its reference, hg38/,
  )
  expect(session.addedViews).toHaveLength(0)
})

// The bubble track marks exactly where haplotypes diverge, which is the most
// natural thing to right-click — but its adapter reads a summary index and
// cannot cut a graph, so the launch has to come from the graph track instead.
test('right-clicking a feature on a non-graph track cuts from the graph track', () => {
  const { createDisplay } = createTestEnvironment()
  const { session, display, view } = createDisplay({ trackId: 'bubble_track' })
  display.openContextMenu({
    item: { featureId: 'bubble1', startBp: 2000, endBp: 2400, name: 'bubble1' },
    displayedRegionIndex: 0,
    clientX: 0,
    clientY: 0,
  })

  const item = find(launchItems(display.contextMenuItems()), LABEL_FEATURE)
  expect(item).toBeDefined()
  click(item)

  const [, snapshot] = session.addedViews[0]!
  expect(snapshot.loadedTrackId).toBe('graph_track')
  expect(snapshot.connectedViewId).toBe(view.id)
  // padded by half the feature's length on each side
  expect(snapshot.loadedRegion).toEqual({
    refName: 'ctgA',
    assemblyName: 'volvox',
    start: 1800,
    end: 2600,
  })
})

// No graph data in the session means no menu clutter anywhere.
test('no graph track in the session adds no items', () => {
  const { createDisplay } = createTestEnvironment({ subgraphCapable: false })
  const { view, display } = createDisplay({ trackId: 'bubble_track' })
  display.openContextMenu({
    item: { featureId: 'bubble1', startBp: 2000, endBp: 2400, name: 'bubble1' },
    displayedRegionIndex: 0,
    clientX: 0,
    clientY: 0,
  })

  expect(find(launchItems(view.menuItems()), LABEL_VISIBLE)).toBeUndefined()
  expect(find(view.rubberBandMenuItems(), LABEL_SELECTION)).toBeUndefined()
  expect(
    find(launchItems(display.contextMenuItems()), LABEL_FEATURE),
  ).toBeUndefined()
})
