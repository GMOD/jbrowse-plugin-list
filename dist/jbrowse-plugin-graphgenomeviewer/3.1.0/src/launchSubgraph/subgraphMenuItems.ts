import BubbleChartIcon from '@mui/icons-material/BubbleChart'

import { launchSubgraphView, subgraphRegionProblem } from './launchSubgraphView'
import { offReferenceProblem } from './subgraphTracks'

import type {
  SubgraphLaunchSession,
  SubgraphRegion,
} from './launchSubgraphView'
import type { SubgraphTrack } from './subgraphTracks'
import type { MenuItem } from '@jbrowse/core/ui'

// Menu items that cut `region` out of each graph track that can supply it.
//
// One capable track is the common case and gets a single flat item — a submenu
// of one is a needless extra click. Several become a submenu naming each track,
// since which graph the subgraph comes from is then a real choice.
//
// A region a track can't be cut at, past the cap or off the graph's reference,
// yields a *disabled* item rather than none: an item that vanishes teaches the
// user nothing, while one greyed out with the reason in its tooltip says what
// to do about it.
//
// `navigate` brings the linear view to `region` before the launch, for an entry
// whose span is not already the view's window, so the graph opens following
// the window it was asked for.
export function subgraphMenuItems({
  label,
  region,
  tracks,
  session,
  connectedViewId,
  navigate,
}: {
  label: string
  region: SubgraphRegion | undefined
  tracks: SubgraphTrack[]
  session: SubgraphLaunchSession
  connectedViewId?: string
  navigate?: (region: SubgraphRegion) => void
}): MenuItem[] {
  let items: MenuItem[] = []
  if (region && tracks.length > 0) {
    const sizeProblem = subgraphRegionProblem(region)
    const entry = (track: SubgraphTrack) => {
      const problem =
        offReferenceProblem(track.referenceAssembly, region.assemblyName) ??
        sizeProblem
      return {
        disabled: problem !== undefined,
        disabledHelpText: problem,
        onClick: () => {
          navigate?.(region)
          launchSubgraphView({
            session,
            region,
            trackId: track.trackId,
            connectedViewId,
            haplotypes: track.haplotypes,
          })
        },
      }
    }
    items =
      tracks.length === 1
        ? [{ label, icon: BubbleChartIcon, ...entry(tracks[0]!) }]
        : [
            {
              label,
              icon: BubbleChartIcon,
              type: 'subMenu',
              subMenu: tracks.map(track => ({
                label: track.name,
                ...entry(track),
              })),
            },
          ]
  }
  return items
}
