import { withRows } from '../launchFromGraph/linearViewTarget'

export interface HighlightRegion {
  refName: string
  start: number
  end: number
  assemblyName?: string
}

export interface GraphViewHighlight {
  key: string
  region: HighlightRegion
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readRegion(value: unknown): HighlightRegion | undefined {
  let region: HighlightRegion | undefined
  if (isRecord(value)) {
    const { refName, start, end, assemblyName } = value
    if (
      typeof refName === 'string' &&
      typeof start === 'number' &&
      typeof end === 'number'
    ) {
      region = {
        refName,
        start,
        end,
        assemblyName:
          typeof assemblyName === 'string' ? assemblyName : undefined,
      }
    }
  }
  return region
}

// Whether a graph view's highlights belong on a given linear view.
// `connectedViewId` is written by the launch menu, so a launched pair is
// explicit. A graph view without one — a hand-written session snapshot, or
// `Add > Graph genome view` followed by a subgraph load — matches any linear
// view, because the alternative is silently drawing nothing.
//
// So does one whose linear view has been closed. Held to an id nothing answers
// to, it matched no view and its hover drew nowhere for the rest of the
// session, the view it next opened included.
function isConnected(
  view: Record<string, unknown>,
  linearViewId: string,
  liveViewIds: ReadonlySet<unknown>,
) {
  const connectedViewId = view.connectedViewId
  return (
    connectedViewId === undefined ||
    connectedViewId === linearViewId ||
    !liveViewIds.has(connectedViewId)
  )
}

// ...and whether the view can mean anything by it. `getHighlightCoords`
// canonicalizes a refName against the region's OWN assembly and then lays it
// out against this view's displayed regions, without ever asking whether the
// two are the same assembly — so a band handed to the wrong view is drawn, at
// coordinates that belong to somebody else's genome.
//
// That is not hypothetical for an unpaired graph, which by the rule above
// matches every linear view in the session. A synteny stack's rows are LGVs on
// different assemblies, and a PanSN name reduces to a bare contig: the five
// E. coli strains each have one refName `chr`, so a graph cut from K12 painted
// its K12 interval across Sakai's row and CFT073's at their own offsets. With
// the assembly checked the reference row keeps the band and the rest correctly
// draw nothing.
//
// A region stating no assembly still passes — `readRegion` leaves it optional,
// and the fallback is the behaviour every existing snapshot has.
function isOnAssembly(
  region: HighlightRegion,
  assemblyNames: string[] | undefined,
) {
  return (
    region.assemblyName === undefined ||
    assemblyNames === undefined ||
    assemblyNames.includes(region.assemblyName)
  )
}

// The highlights a linear view should draw for the graph views connected to it.
// Reads `session.views` structurally: the members it needs are declared by
// GraphGenomeView, not by the AbstractViewModel the session array is typed as.
export function graphViewHighlights(
  views: unknown[],
  linearViewId: string,
  // the drawing view's own assemblies, so a band is only drawn where its
  // coordinates mean something — see isOnAssembly
  linearAssemblyNames?: string[],
): GraphViewHighlight[] {
  const highlights: GraphViewHighlight[] = []
  const liveViewIds = new Set(
    withRows(views).map(view => (isRecord(view) ? view.id : undefined)),
  )
  for (const view of views) {
    if (
      isRecord(view) &&
      view.type === 'GraphGenomeView' &&
      isConnected(view, linearViewId, liveViewIds)
    ) {
      const region = readRegion(view.hoverHighlight)
      if (region && isOnAssembly(region, linearAssemblyNames)) {
        highlights.push({
          key: typeof view.id === 'string' ? view.id : 'graph',
          region,
        })
      }
    }
  }
  return highlights
}
