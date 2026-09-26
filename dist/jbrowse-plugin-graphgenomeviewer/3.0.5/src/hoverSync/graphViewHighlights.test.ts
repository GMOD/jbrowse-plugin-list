import { graphViewHighlights } from './graphViewHighlights'

const HIGHLIGHT = {
  refName: 'chr6',
  start: 32_500_000,
  end: 32_501_000,
  assemblyName: 'hg38',
}

function graphView(props: Record<string, unknown>) {
  return { id: 'graph1', type: 'GraphGenomeView', ...props }
}

test('a graph view launched from this linear view contributes its highlight', () => {
  expect(
    graphViewHighlights(
      [graphView({ connectedViewId: 'lgv1', hoverHighlight: HIGHLIGHT })],
      'lgv1',
    ),
  ).toEqual([{ key: 'graph1', region: HIGHLIGHT }])
})

const linearView = (id: string) => ({ id, type: 'LinearGenomeView' })

test('a graph view launched from a different linear view is ignored', () => {
  expect(
    graphViewHighlights(
      [
        linearView('lgv2'),
        graphView({ connectedViewId: 'lgv2', hoverHighlight: HIGHLIGHT }),
      ],
      'lgv1',
    ),
  ).toEqual([])
})

// The view it was launched from has been closed. Held to that id the graph
// matched no view at all, and its hover drew nowhere for the rest of the
// session, the view it next opened included.
test('a graph view whose linear view is gone broadcasts like an unpaired one', () => {
  expect(
    graphViewHighlights(
      [
        linearView('lgv1'),
        graphView({ connectedViewId: 'closed', hoverHighlight: HIGHLIGHT }),
      ],
      'lgv1',
    ),
  ).toHaveLength(1)
})

test('a linear view that is a row of a synteny view still counts as there', () => {
  expect(
    graphViewHighlights(
      [
        { id: 'syn', type: 'LinearSyntenyView', views: [linearView('row2')] },
        graphView({ connectedViewId: 'row2', hoverHighlight: HIGHLIGHT }),
      ],
      'lgv1',
    ),
  ).toEqual([])
})

// A hand-written session snapshot (the docs figures build one) carries
// loadedRegion but no connectedViewId. Drawing nothing there would make the
// feature look broken, so an unpaired graph view broadcasts.
test('a graph view with no connection broadcasts to any linear view', () => {
  expect(
    graphViewHighlights([graphView({ hoverHighlight: HIGHLIGHT })], 'lgv1'),
  ).toHaveLength(1)
})

test('nothing hovered means nothing to draw', () => {
  expect(
    graphViewHighlights([graphView({ connectedViewId: 'lgv1' })], 'lgv1'),
  ).toEqual([])
})

test('other view types never contribute', () => {
  expect(
    graphViewHighlights(
      [{ id: 'lgv2', type: 'LinearGenomeView', hoverHighlight: HIGHLIGHT }],
      'lgv1',
    ),
  ).toEqual([])
})

test('an incomplete highlight is skipped rather than drawn at NaN', () => {
  expect(
    graphViewHighlights(
      [graphView({ hoverHighlight: { refName: 'chr6', start: 1 } })],
      'lgv1',
    ),
  ).toEqual([])
})

test('several connected graph views each contribute a highlight', () => {
  const views = [
    { id: 'a', type: 'GraphGenomeView', hoverHighlight: HIGHLIGHT },
    { id: 'b', type: 'GraphGenomeView', hoverHighlight: HIGHLIGHT },
  ]
  expect(graphViewHighlights(views, 'lgv1').map(h => h.key)).toEqual(['a', 'b'])
})

// A graph launched from a synteny row pairs with the row's id. Graph views are
// always top-level, so the row asking with its own id needs no walk into the
// stack view's views[].
test('a graph view paired with a row of a stack view draws on that row', () => {
  const row = { id: 'row1', type: 'LinearGenomeView' }
  const views = [
    { id: 'synteny1', type: 'LinearSyntenyView', views: [row] },
    graphView({ connectedViewId: 'row1', hoverHighlight: HIGHLIGHT }),
  ]
  expect(graphViewHighlights(views, 'row1')).toEqual([
    { key: 'graph1', region: HIGHLIGHT },
  ])
  expect(graphViewHighlights(views, 'synteny1')).toEqual([])
})

// The other half of the same guard `hoverInRegion` applies on the way in.
// `getHighlightCoords` canonicalizes a refName against the region's own
// assembly and then lays it out against the drawing view's displayed regions,
// never asking whether the two are the same assembly — so a band handed to the
// wrong view is drawn, at somebody else's coordinates.
//
// An unpaired graph broadcasts by the rule above, and a synteny stack's rows
// are LGVs on different assemblies. The five E. coli strains each hold one
// refName `chr`, so a K12 cut painted its interval across every row.
describe("the drawing view has to be on the highlight's assembly", () => {
  const unpaired = [graphView({ hoverHighlight: HIGHLIGHT })]

  test('a view showing that assembly draws the band', () => {
    expect(graphViewHighlights(unpaired, 'lgv1', ['hg38'])).toHaveLength(1)
  })

  test('a row of the stack on another assembly draws nothing', () => {
    expect(graphViewHighlights(unpaired, 'lgv1', ['HG002#1'])).toEqual([])
  })

  test('a view holding several assemblies draws it if any of them matches', () => {
    expect(
      graphViewHighlights(unpaired, 'lgv1', ['HG002#1', 'hg38']),
    ).toHaveLength(1)
  })

  // Both fallbacks: a caller that does not state the view's assemblies, and a
  // highlight that states none of its own. Either way this is the behaviour
  // every existing snapshot already has.
  test('an unstated assembly on either side broadcasts as before', () => {
    expect(graphViewHighlights(unpaired, 'lgv1')).toHaveLength(1)
    const noAssembly = [
      graphView({
        hoverHighlight: { ...HIGHLIGHT, assemblyName: undefined },
      }),
    ]
    expect(graphViewHighlights(noAssembly, 'lgv1', ['Sakai'])).toHaveLength(1)
  })
})
