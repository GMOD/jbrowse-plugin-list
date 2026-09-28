export interface NavigableLinearView {
  id: string
  assemblyNames: string[]
  navToLocString: (locString: string, assemblyName?: string) => unknown
  // The other way of answering "where is this node": mark it rather than scroll
  // to it. Optional, and not part of isLinearView's test — navigating is what
  // makes a view a target here, and a view that cannot be marked can still be
  // moved.
  addToHighlights?: (highlight: {
    refName: string
    start: number
    end: number
    assemblyName: string
  }) => unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// Reads `session.views` structurally, the same way graphViewHighlights does: the
// members needed here are declared by LinearGenomeView, not by the
// AbstractViewModel the session array is typed as.
function isLinearView(view: unknown): view is NavigableLinearView {
  return (
    isRecord(view) &&
    view.type === 'LinearGenomeView' &&
    typeof view.id === 'string' &&
    typeof view.navToLocString === 'function' &&
    Array.isArray(view.assemblyNames)
  )
}

// The view a graph was launched from is not always in `session.views`: a row of
// a LinearSyntenyView, LinearComparativeView or BreakpointSplitView sits in
// that view's own `views[]`, so the candidates are the session's views plus one
// level of rows.
export function withRows(views: unknown[]) {
  return views.flatMap(view =>
    isRecord(view) && Array.isArray(view.views)
      ? [view, ...view.views]
      : [view],
  )
}

// The linear view a "show me this" from the graph should move, rather than
// opening a pane beside it. Three cases, in order:
//
//   - the view this graph is paired with (`connectedViewId`), which is either
//     the view the graph was launched from or the one it later opened itself.
//     Explicit, so it wins.
//   - failing that, the only linear view in the session showing this assembly.
//     The pangenome sessions this view ships in are a linear view above a graph
//     with no pairing recorded, and there "the linear view" is unambiguous — the
//     same reasoning hoverSync's isConnected already applies to highlights.
//   - two or more candidates and no pairing: nothing. Guessing which of the
//     user's views to scroll is worse than opening one that is ours to move.
//
// Assembly-gated throughout: a linear view on a different assembly cannot show
// this location at all.
export function linearViewTarget({
  views,
  connectedViewId,
  assemblyName,
}: {
  views: unknown[]
  connectedViewId: string | undefined
  assemblyName: string
}) {
  const candidates = withRows(views)
    .filter(view => isLinearView(view))
    .filter(view => view.assemblyNames.includes(assemblyName))
  const connected = candidates.find(view => view.id === connectedViewId)
  return connected ?? (candidates.length === 1 ? candidates[0] : undefined)
}
