import { setConf } from '@jbrowse/core/configuration'
import { getSnapshot } from '@jbrowse/mobx-state-tree'

import type { AnyConfigurationModel } from '@jbrowse/core/configuration'

// The graph's own off-ramp charcoal, for a segment with no reference
// coordinate (GeometryBuilder's REFERENCE_RAMP_ALT_COLOR).
export const OFF_REFERENCE_COLOR = 'rgb(60,65,72)'

// The reference-position ramp as a `color` expression a linear track can run:
// hue 0 to 300 over the domain by the feature's reference midpoint, the same
// function of the same two numbers the graph paints its nodes with. `rank` is
// what RgfaTabixAdapter puts on a feature; a track carrying none reads
// `undefined > 0` as false and stays on the ramp.
export function referencePositionColor({
  start,
  end,
}: {
  start: number
  end: number
}) {
  const mid = "(get(feature,'start')+get(feature,'end'))/2"
  const hue = `min(300, max(0, (${mid} - ${start}) / ${end - start} * 300))`
  return `jexl:get(feature,'rank')>0 ? '${OFF_REFERENCE_COLOR}' : 'hsl(' + ${hue} + ',70%,50%)'`
}

export interface LaneDisplay {
  configuration: AnyConfigurationModel
}

interface LaneTrack {
  configuration: { trackId: string }
  displays: LaneDisplay[]
}

interface LaneView {
  id: string
  tracks?: LaneTrack[]
}

function isLaneView(view: unknown): view is LaneView {
  return (
    typeof view === 'object' &&
    view !== null &&
    'id' in view &&
    Array.isArray((view as { tracks?: unknown }).tracks)
  )
}

// The display a graph was cut from: the track by id in the linear view it is
// paired with, or in any linear view holding it when the graph was never
// paired (a hand-written session), the same rule the hover sync uses.
export function sourceLaneDisplay(
  views: unknown[],
  connectedViewId: string | undefined,
  trackId: string,
) {
  for (const view of views) {
    if (
      isLaneView(view) &&
      (connectedViewId === undefined || view.id === connectedViewId)
    ) {
      const track = view.tracks?.find(t => t.configuration.trackId === trackId)
      const display = track?.displays[0]
      if (display) {
        return display
      }
    }
  }
  return undefined
}

// Idempotent, since the autorun that calls this re-fires on every domain read.
// A host at 5.0.0-beta.9 or later keeps `color` as a channel object whose
// `value` holds the expression; earlier hosts keep the bare string.
export function paintSourceLane(display: LaneDisplay, color: string) {
  const { color: current } = getSnapshot(display.configuration) as {
    color?: unknown
  }
  const painted =
    typeof current === 'object' && current !== null && 'value' in current
      ? current.value
      : current
  if (painted !== color) {
    setConf(display, 'color', color)
  }
}
