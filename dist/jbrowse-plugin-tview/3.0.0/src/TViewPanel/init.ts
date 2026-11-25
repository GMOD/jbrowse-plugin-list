import { parseLocString } from '@jbrowse/core/util'
import { getTrackName } from '@jbrowse/core/util/tracks'

import { MAX_BP } from '../LaunchTView/limits'

import type { FetchRegion, TviewSource } from '../LaunchTView/fetchTviewPlan'
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
 * - There is one code path. Launching from a menu, restoring a saved session
 *   and following a link all end up applying the same blob, and changing what
 *   the view shows from its own menu is replacing that blob.
 *
 * Unlike LinearGenomeView's, this init is **kept, not cleared**. What it
 * resolves to — the alignment and its row table — is kept out of snapshots and
 * rebuilt from it on restore, so the blob is the only durable statement of what
 * the view is.
 */
export interface TviewInit {
  /** assembly the locus and the tracks belong to */
  assembly: string
  /** locstring, e.g. `chrX:146,993,530..146,993,670` */
  loc: string
  /** the alignment files to draw rows from, in order */
  tracks: TviewTrackInit[]
}

export type RegionCheck =
  | { region: FetchRegion; error?: undefined }
  | { region?: undefined; error: string }

/** the slice of a loaded assembly that a locstring is resolved against */
export interface LocAssembly {
  name: string
  isValidRefName: (refName: string) => boolean
  getCanonicalRefName2: (refName: string) => string
  getRegionForRefName: (
    refName: string,
  ) => { start: number; end: number } | undefined
}

function errorText(e: unknown) {
  return e instanceof Error ? e.message : String(e)
}

/**
 * The region `loc` names on `assembly`, under the assembly's own name for the
 * sequence and clamped to it, or why there is none: a locstring that does not
 * parse, a region off the end of the contig, or one wider than {@link MAX_BP}.
 * A bare refName means the whole contig, and is held to the same limit.
 */
export function checkRegion(assembly: LocAssembly, loc: string): RegionCheck {
  try {
    const parsed = parseLocString(loc, refName =>
      assembly.isValidRefName(refName),
    )
    const refName = assembly.getCanonicalRefName2(parsed.refName)
    const contig = assembly.getRegionForRefName(refName)
    return contig
      ? clampToContig({
          assemblyName: assembly.name,
          refName,
          start: Math.max(contig.start, parsed.start ?? contig.start),
          end: Math.min(contig.end, parsed.end ?? contig.end),
          loc,
          contigLength: contig.end,
        })
      : { error: `${assembly.name} has no sequence named ${refName}` }
  } catch (e) {
    return { error: errorText(e) }
  }
}

function clampToContig({
  loc,
  contigLength,
  ...region
}: FetchRegion & { loc: string; contigLength: number }): RegionCheck {
  const width = region.end - region.start
  const n = (x: number) => x.toLocaleString('en-US')
  return width <= 0
    ? {
        error: `${loc} lies outside ${region.refName}, which is ${n(contigLength)}bp`,
      }
    : width > MAX_BP
      ? {
          error: `Region is ${n(width)}bp, wider than the ${n(MAX_BP)}bp limit`,
        }
      : { region }
}

/** {@link checkRegion} for `init`, or undefined until its assembly has loaded */
export function initRegion(session: AbstractSessionModel, init: TviewInit) {
  const assembly = session.assemblyManager.get(init.assembly)
  return assembly?.initialized ? checkRegion(assembly, init.loc) : undefined
}

/**
 * One entry of `init.tracks`, resolved against the session.
 *
 * `sample` is always a string here. Which of the three candidates it came from
 * — what the init asked for, what the track config is called, or the trackId —
 * is settled once, at the point where all three are in hand, so nothing
 * downstream has to ask again. `||` rather than `??` on purpose: a track
 * configured with `name: ''` should fall through to its id, not label a band
 * with an empty string.
 */
interface ResolvedTrack {
  trackId: string
  adapterConfig: Record<string, unknown>
  sample: string
}

export function entryTrackId(entry: TviewTrackInit) {
  return typeof entry === 'string' ? entry : entry.trackId
}

function resolveTrack(
  session: AbstractSessionModel,
  entry: TviewTrackInit,
): ResolvedTrack | undefined {
  const trackId = entryTrackId(entry)
  const sample = typeof entry === 'string' ? undefined : entry.sample
  const conf = session.getTrackById(trackId)
  return conf
    ? {
        trackId,
        adapterConfig: conf.adapter as Record<string, unknown>,
        sample: sample || getTrackName(conf, session) || trackId,
      }
    : undefined
}

/** what rows from `entry` are grouped under, or its trackId if no track has it */
export function trackLabel(
  session: AbstractSessionModel,
  entry: TviewTrackInit,
) {
  return resolveTrack(session, entry)?.sample ?? entryTrackId(entry)
}

/**
 * The sources `init.tracks` names, or undefined until every one of them
 * resolves. All or nothing: a partial set comes back with samples missing and
 * nothing on screen says any were.
 */
export function initSources(
  session: AbstractSessionModel,
  init: TviewInit,
): TviewSource[] | undefined {
  const resolved = init.tracks.map(entry => resolveTrack(session, entry))
  const found = resolved.filter(t => t !== undefined)
  return found.length === init.tracks.length ? found : undefined
}

/** the trackIds `init.tracks` names that this session has no track for */
export function missingTrackIds(
  session: AbstractSessionModel,
  init: TviewInit,
) {
  return init.tracks
    .map(entryTrackId)
    .filter(trackId => !session.getTrackById(trackId))
}
