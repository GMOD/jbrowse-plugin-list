import { readConfObject } from '@jbrowse/core/configuration'
import { parseLocString } from '@jbrowse/core/util'

import { findTrackConf } from '../LaunchTView/fetchTviewPlan'

import type { TviewSource } from '../LaunchTView/fetchTviewPlan'
import type { AbstractSessionModel } from '@jbrowse/core/util'

/**
 * One alignment file the view reads, and optionally the name to group its rows
 * under. A bare trackId is the same thing with the name left to the track.
 */
export type TviewTrackInit = string | { trackId: string; sample?: string }

/**
 * Everything a tview is: a locus, an assembly, and the alignment files to read
 * it from.
 *
 * The view is declared with this and derives the rest, in the shape
 * LinearGenomeView's `init` uses. Two things follow from that which are worth
 * saying out loud:
 *
 * - A session can **author** a tview. `{ type: 'TView', init: { … } }` in a
 *   defaultSession opens one with no click path — as does the flat form of the
 *   same keys in a session spec URL, which is what makes a repeat locus a link.
 * - There is one code path. Launching from the track menu, restoring a saved
 *   session and following a link all end up applying the same blob, so the
 *   launch dialog does not build the view — it names it.
 *
 * Unlike LinearGenomeView's, this init is **kept, not cleared**. What it
 * resolves to is a multiple alignment held as one string, which react-msaview
 * drops from snapshots past 50kb and has no file to reload from; the blob is
 * both smaller than what it produces and the only durable statement of what the
 * view is.
 */
export interface TviewInit {
  /** assembly the locus and the tracks belong to */
  assembly: string
  /** locstring, e.g. `chrX:146,993,530..146,993,670` */
  loc: string
  /** the alignment files to draw rows from, in order */
  tracks: TviewTrackInit[]
}

// Derived from the interface so it cannot drift: the Record requires exactly one
// entry per key, so adding a field without listing it here is a compile error
// rather than a key that silently reads as a view prop.
const initKeyMap: Record<keyof TviewInit, true> = {
  assembly: true,
  loc: true,
  tracks: true,
}
export const initKeys = new Set<string>(Object.keys(initKeyMap))

/** the region `init.loc` names, or undefined until the assembly can parse it */
export function initRegion(session: AbstractSessionModel, init: TviewInit) {
  const { assemblyManager } = session
  if (!assemblyManager.get(init.assembly)?.initialized) {
    return undefined
  }
  const parsed = parseLocString(init.loc, refName =>
    assemblyManager.isValidRefName(refName, init.assembly),
  )
  return {
    assemblyName: init.assembly,
    refName: parsed.refName,
    start: parsed.start ?? 0,
    end: parsed.end ?? 0,
  }
}

/**
 * One entry of `init.tracks`, resolved against the session.
 *
 * `sample` is always a string here. Which of the three candidates it came from
 * — what the init asked for, what the track config is called, or the trackId —
 * is settled once, at the point where all three are in hand, so nothing
 * downstream has to ask again. `||` rather than `??` on purpose: a track
 * configured with `name: ''` should fall through to its id, not label a clade
 * with an empty string.
 */
interface ResolvedTrack {
  trackId: string
  adapterConfig: unknown
  sample: string
}

function resolveTrack(
  session: AbstractSessionModel,
  entry: TviewTrackInit,
): ResolvedTrack | undefined {
  const { trackId, sample } =
    typeof entry === 'string' ? { trackId: entry, sample: undefined } : entry
  const conf = findTrackConf(session, trackId)
  return conf
    ? {
        trackId,
        adapterConfig: readConfObject(conf, 'adapter'),
        sample: sample || (readConfObject(conf, 'name') as string) || trackId,
      }
    : undefined
}

/**
 * The sources `init.tracks` names, or undefined until every one of them
 * resolves. All or nothing: a partial set comes back with samples missing and
 * nothing on screen says any were.
 *
 * Whether the names are *used* is decided here and only here — one file's rows
 * need no prefix, and would gain a tree of one clade drawn beside a list.
 */
export function initSources(
  session: AbstractSessionModel,
  init: TviewInit,
): TviewSource[] | undefined {
  const resolved = init.tracks.map(entry => resolveTrack(session, entry))
  const found = resolved.filter(t => t !== undefined)
  if (found.length !== init.tracks.length) {
    return undefined
  }
  const labelled = found.length > 1
  return found.map(track => ({
    trackId: track.trackId,
    adapterConfig: track.adapterConfig,
    sample: labelled ? track.sample : undefined,
  }))
}
