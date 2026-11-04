import { narrowsChains } from './residueFilter'
import { parseSite } from './residueSpec'

const MARK_TYPES = ['spheres', 'sticks', 'cartoon']
const HEX_COLOR = /^#[0-9a-f]{6}$/i

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function encodingProblems(where: string, entry: Record<string, unknown>) {
  const value = isRecord(entry.encoding)
    ? isRecord(entry.encoding.color)
      ? entry.encoding.color.value
      : undefined
    : undefined
  return [
    ...('color' in entry
      ? [`${where}.color is now encoding: { color: { value: '#rrggbb' } }`]
      : []),
    ...(value !== undefined &&
    (typeof value !== 'string' || !HEX_COLOR.test(value))
      ? [
          `${where}.encoding.color.value is a #rrggbb color, not ${JSON.stringify(value)}`,
        ]
      : []),
  ]
}

function siteProblems(where: string, key: string, site: unknown) {
  return typeof site === 'string' && parseSite(site)
    ? []
    : [
        `${where}.${key} is a site such as A:248, A:248@NH2, MOV or G:*, not ${String(site)}`,
      ]
}

/** What a structure draws, as the checks read it. */
interface DrawnBy {
  chains?: string[]
  filter?: unknown
}

/**
 * Why `marks` would draw something other than what it says: a site or mark
 * type that does not parse, a color that is not #rrggbb, or a cartoon over a
 * chain the structure already draws whole. `structures` are the view's, whose
 * `chains` and `filter` say what is drawn.
 */
export function markProblems(
  marks: unknown,
  structures: readonly DrawnBy[] = [],
): string[] {
  if (marks === undefined) {
    return []
  }
  if (!Array.isArray(marks)) {
    return ['marks is a list']
  }
  return marks.flatMap((mark, i) => {
    const where = `marks[${i}]`
    if (!isRecord(mark)) {
      return [`${where} is an object such as { site: 'A:12', mark: 'spheres' }`]
    }
    const site =
      typeof mark.site === 'string' ? parseSite(mark.site) : undefined
    const structure =
      structures[typeof mark.structure === 'number' ? mark.structure : 0]
    const drawn = structure?.chains
    return [
      ...siteProblems(where, 'site', mark.site),
      ...(mark.mark !== undefined && !MARK_TYPES.includes(mark.mark as string)
        ? [
            `${where}.mark is one of ${MARK_TYPES.join(', ')}, not ${JSON.stringify(mark.mark)}`,
          ]
        : []),
      ...encodingProblems(where, mark),
      ...(mark.mark === 'cartoon' &&
      site?.kind === 'chain' &&
      !narrowsChains(structure) &&
      (!drawn || drawn.includes(site.chain))
        ? [
            `${where} draws chain ${site.chain} as a cartoon over the one the structure draws; list the other chains in chains`,
          ]
        : []),
    ]
  })
}

/** The same check for `distances`: two sites and a constant encoding. */
export function distanceProblems(distances: unknown): string[] {
  if (distances === undefined) {
    return []
  }
  if (!Array.isArray(distances)) {
    return ['distances is a list']
  }
  return distances.flatMap((d, i) => {
    const where = `distances[${i}]`
    return isRecord(d)
      ? [
          ...siteProblems(where, 'a', d.a),
          ...siteProblems(where, 'b', d.b),
          ...encodingProblems(where, d),
        ]
      : [`${where} is an object such as { a: 'A:46@NZ', b: 'A:80@NZ' }`]
  })
}

/**
 * A mark or distance written the way 1.23 and 1.24 read it, `style` and a
 * string `color`, in the encoding spelling; any other entry as it is.
 */
function migratedLayer(entry: unknown) {
  if (!isRecord(entry)) {
    return entry
  }
  const { style, color, ...rest } = entry
  return {
    ...rest,
    ...(rest.mark === undefined && style !== undefined ? { mark: style } : {}),
    ...(typeof color === 'string'
      ? rest.encoding === undefined
        ? { encoding: { color: { value: color } } }
        : {}
      : color === undefined
        ? {}
        : { color }),
  }
}

function migratedList(list: unknown) {
  return Array.isArray(list) ? list.map(migratedLayer) : list
}

function isFiniteNumber(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x)
}

function isTriple(x: unknown): x is [number, number, number] {
  return Array.isArray(x) && x.length === 3 && x.every(isFiniteNumber)
}

function samePoint(a: unknown, b: unknown) {
  return isTriple(a) && isTriple(b) && a.every((v, i) => v === b[i])
}

function tripleProblems(where: string, value: unknown) {
  return isTriple(value)
    ? []
    : [
        `${where} is three numbers such as [0, 1, 0], not ${JSON.stringify(value)}`,
      ]
}

const CAMERA_MODES: readonly unknown[] = ['perspective', 'orthographic']

/**
 * Why `camera` would not place the eye: a point that is not three numbers, an
 * eye on its own target, no up direction, a radius that clips everything, or
 * an unknown projection.
 */
export function cameraProblems(camera: unknown): string[] {
  return camera === undefined
    ? []
    : isRecord(camera)
      ? [
          ...tripleProblems('camera.position', camera.position),
          ...tripleProblems('camera.target', camera.target),
          ...tripleProblems('camera.up', camera.up),
          ...(samePoint(camera.position, camera.target)
            ? ['camera.position is camera.target, so the eye looks nowhere']
            : []),
          ...(isTriple(camera.up) && camera.up.every(v => v === 0)
            ? ['camera.up is [0, 0, 0], which points nowhere']
            : []),
          ...(camera.radius === undefined ||
          (isFiniteNumber(camera.radius) && camera.radius > 0)
            ? []
            : [
                `camera.radius is a positive number, not ${JSON.stringify(camera.radius)}`,
              ]),
          ...(camera.mode === undefined || CAMERA_MODES.includes(camera.mode)
            ? []
            : [
                `camera.mode is perspective or orthographic, not ${JSON.stringify(camera.mode)}`,
              ]),
        ]
      : ['camera is an object such as { position, target, up }']
}

/** `surface`: an object whose `opacity`, if given, is 0 to 1. */
export function surfaceProblems(surface: unknown): string[] {
  return surface === undefined
    ? []
    : isRecord(surface)
      ? surface.opacity === undefined ||
        (isFiniteNumber(surface.opacity) &&
          surface.opacity >= 0 &&
          surface.opacity <= 1)
        ? []
        : [
            `surface.opacity is a number from 0 to 1, not ${JSON.stringify(surface.opacity)}`,
          ]
      : ['surface is an object such as { opacity: 0.5 }']
}

function flagProblems(figure: Record<string, unknown>) {
  return (['silhouettes', 'occlusion'] as const).flatMap(key =>
    figure[key] === undefined || typeof figure[key] === 'boolean'
      ? []
      : [`${key} is true or false, not ${JSON.stringify(figure[key])}`],
  )
}

/**
 * The figure properties a snapshot, a launch and applyFigure set, by the
 * names the view model gives them.
 */
export const FIGURE_KEYS = [
  'camera',
  'surface',
  'marks',
  'distances',
  'silhouettes',
  'occlusion',
] as const

const FIGURE_KEY_SET: ReadonlySet<string> = new Set(FIGURE_KEYS)

/**
 * The figure properties migrated from the 1.24 spelling of `marks` and
 * `distances`, then refused with every problem found in any of them.
 */
export function checkedFigure<T extends Record<string, unknown>>(
  snapshot: T,
  structures: readonly DrawnBy[] = [],
): T {
  const migrated = {
    ...snapshot,
    ...(snapshot.marks === undefined
      ? {}
      : { marks: migratedList(snapshot.marks) }),
    ...(snapshot.distances === undefined
      ? {}
      : { distances: migratedList(snapshot.distances) }),
  }
  const problems = [
    ...markProblems(migrated.marks, structures),
    ...distanceProblems(migrated.distances),
    ...cameraProblems(migrated.camera),
    ...surfaceProblems(migrated.surface),
    ...flagProblems(migrated),
  ]
  if (problems.length > 0) {
    throw new Error(problems.join('; '))
  }
  return migrated
}

/**
 * checkedFigure for a change made at runtime, which also refuses a key that is
 * not a figure property rather than ignoring it.
 */
export function checkedFigureChange<T extends Record<string, unknown>>(
  change: T,
  structures: readonly DrawnBy[],
): T {
  const unknownKeys = Object.keys(change).filter(
    key => !FIGURE_KEY_SET.has(key),
  )
  if (unknownKeys.length > 0) {
    throw new Error(
      `a figure sets ${FIGURE_KEYS.join(', ')}, not ${unknownKeys.join(', ')}`,
    )
  }
  return checkedFigure(change, structures)
}
