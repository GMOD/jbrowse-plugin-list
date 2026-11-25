import { isPairwiseAlignment, resolveStructureUrl } from 'p2s_mapper'

import { cameraProblems, surfaceProblems } from '../ProteinView/markProblems'
import { VARIANT_SPELLING, parseLaunchVariant } from './launchVariant'

import type { DistanceMeasurement } from '../ProteinView/measurements'
import type {
  ProteinStructureSpec,
  ProteinViewSpec,
} from '../ProteinView/proteinViewSpec'
import type { FilterPredicate } from '../ProteinView/residueFilter'
import type { ResidueMark } from '../ProteinView/residueMarks'
import type { SavedCamera } from '../ProteinView/savedCamera'
import type { ProteinSurface } from '../ProteinView/surface'
import type { LaunchVariant } from './launchVariant'
import type { ConnectedViewSpec } from './resolveShortLaunch'
import type { SimpleFeatureSerialized } from '@jbrowse/core/util'
import type { ResidueRange, ResidueRanges } from 'p2s_mapper'

export type LaunchStructure = ProteinStructureSpec

type StructureKey = keyof ProteinStructureSpec

/**
 * What a structure key means written on the launch itself. A `launchWide` key
 * is the default every structure shares; the others describe one structure, so
 * they route into it when the launch names a single structure and apply to
 * none beside `structures`.
 */
type TopLevelRole = 'source' | 'selection' | 'setting' | 'launchWide'

const STRUCTURE_KEY_ROLES = {
  url: 'source',
  data: 'source',
  fileName: 'setting',
  uniprotId: 'source',
  alphaFoldComplexId: 'source',
  pdbId: 'source',
  initialSelection: 'selection',
  initialResidues: 'selection',
  initialTranscriptResidues: 'selection',
  mappedEntityId: 'setting',
  pairwiseAlignment: 'setting',
  alignmentImported: 'setting',
  hidden: 'setting',
  assembly: 'setting',
  chains: 'setting',
  filter: 'setting',
  feature: 'launchWide',
  userProvidedTranscriptSequence: 'launchWide',
  connectedViewId: 'launchWide',
} satisfies Record<StructureKey, TopLevelRole>

function isStructureKey(key: string): key is StructureKey {
  return Object.hasOwn(STRUCTURE_KEY_ROLES, key)
}

export const STRUCTURE_KEYS =
  Object.keys(STRUCTURE_KEY_ROLES).filter(isStructureKey)

const BESIDE_STRUCTURES = {
  source: 'names no structure; add it as an entry of `structures`',
  selection: 'applies to no structure; put it on the one it selects in',
  setting: 'applies to no structure; put it on the one it describes',
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isFeature(value: unknown): value is SimpleFeatureSerialized {
  return isRecord(value)
}

// the shape only: the view model refuses, with the reason, a filter predicate,
// mark or distance that does not read, as it does a color
function isRecordList<T extends object>(value: unknown): value is T[] {
  return Array.isArray(value) && value.every(isRecord)
}

function isSavedCamera(value: unknown): value is SavedCamera {
  return value !== undefined && cameraProblems(value).length === 0
}

function isSurface(value: unknown): value is ProteinSurface {
  return value !== undefined && surfaceProblems(value).length === 0
}

function isResidueRange(value: unknown): value is ResidueRange {
  return (
    isRecord(value) &&
    typeof value.start === 'number' &&
    typeof value.end === 'number'
  )
}

function isResidueRanges(value: unknown): value is ResidueRanges {
  return Array.isArray(value)
    ? value.every(isResidueRange)
    : isResidueRange(value)
}

function isTrackSpec(value: unknown) {
  return isString(value) || isRecord(value)
}

export function isConnectedViewSpec(
  value: unknown,
): value is ConnectedViewSpec {
  return (
    isRecord(value) &&
    (value.loc === undefined || isString(value.loc)) &&
    (value.assembly === undefined || isString(value.assembly)) &&
    (value.tracks === undefined ||
      (Array.isArray(value.tracks) && value.tracks.every(isTrackSpec)))
  )
}

const RANGES = '{ start, end } numbers or an array of them'

/**
 * Launch text comes from a url, and the view model throws on a wrongly typed
 * property, so the reader reports a value of the wrong type under the name
 * `at` gives it and leaves it out.
 */
export function fieldReader<K extends string>(
  fields: ReadonlyMap<string, unknown>,
  at: (key: K) => string,
  warnings: string[],
) {
  return function read<T>(
    key: K,
    accepts: (value: unknown) => value is T,
    expected: string,
  ) {
    const value = fields.get(key)
    if (value === undefined || accepts(value)) {
      return value
    }
    warnings.push(`${at(key)} is not ${expected} and was ignored`)
    return undefined
  }
}

/**
 * A figure layer read by the view's own check, so a launch drops, with the
 * view's reasons, what the view would refuse.
 */
function figureLayerReader(
  fields: ReadonlyMap<string, unknown>,
  warnings: string[],
) {
  return function read<T>(
    key: string,
    accepts: (value: unknown) => value is T,
    problemsOf: (value: unknown) => string[],
  ) {
    const value = fields.get(key)
    const accepted = value !== undefined && accepts(value) ? value : undefined
    if (value !== undefined && accepted === undefined) {
      warnings.push(`\`${key}\` was ignored: ${problemsOf(value).join('; ')}`)
    }
    return accepted
  }
}

/** The view's own settings, untrusted where a url wrote them. */
export interface LaunchViewSettings extends Omit<
  ProteinViewSpec,
  'structures' | 'color' | 'alignmentAlgorithm'
> {
  id?: string
  alignmentAlgorithm?: string
  color?: unknown
  colorScheme?: string
}

/** What links the launch to a transcript and places the views. */
export interface LaunchLinkage {
  gene?: string
  transcriptId?: string
  uniprotId?: string
  connectedView?: ConnectedViewSpec
  connectedViewId?: string
  sideBySide?: boolean
  feature?: SimpleFeatureSerialized
  userProvidedTranscriptSequence?: string
  variant?: LaunchVariant
}

/**
 * The key that spells the launch's transcript out. Neither `gene` nor
 * `transcriptId` is looked up beside it, since the model, translation and
 * genome view a lookup picks all follow the transcript it finds.
 */
export function spelledTranscriptKey({
  feature,
  userProvidedTranscriptSequence,
}: Pick<LaunchLinkage, 'feature' | 'userProvidedTranscriptSequence'>) {
  return feature
    ? 'feature'
    : userProvidedTranscriptSequence
      ? 'userProvidedTranscriptSequence'
      : undefined
}

const TRANSCRIPT_LOOKUPS = [
  'gene',
  'transcriptId',
] satisfies (keyof LaunchLinkage)[]

function skippedLookups(linkage: LaunchLinkage) {
  const spelledBy = spelledTranscriptKey(linkage)
  const missing = [
    linkage.feature
      ? undefined
      : '`feature` (the transcript that maps the structure to the genome)',
    linkage.userProvidedTranscriptSequence
      ? undefined
      : '`userProvidedTranscriptSequence` (the translation the structure is aligned to)',
    linkage.connectedView || linkage.connectedViewId
      ? undefined
      : 'a `connectedView` or `connectedViewId` (the genome view it links to)',
  ].filter(need => need !== undefined)
  const advice = missing.length > 0 ? `; give ${missing.join(' and ')}` : ''
  return spelledBy
    ? TRANSCRIPT_LOOKUPS.filter(key => linkage[key]).map(
        key => `\`${key}\` is not looked up beside \`${spelledBy}\`${advice}`,
      )
    : []
}

const LAUNCH_KEYS = [
  'structures',
  'gene',
  'transcriptId',
  'connectedView',
  'sideBySide',
  'variant',
]

// `uniprotId` is a structure's source too, which readStructure reports, so
// a wrongly typed one is left out here without a second warning
function readLinkage(
  fields: ReadonlyMap<string, unknown>,
  warnings: string[],
): LaunchLinkage {
  const read = fieldReader<keyof LaunchLinkage>(
    fields,
    key => `\`${key}\``,
    warnings,
  )
  const uniprotId = fields.get('uniprotId')
  const variant = read(
    'variant',
    isString,
    `a string such as ${VARIANT_SPELLING}`,
  )
  return {
    gene: read('gene', isString, 'a string'),
    transcriptId: read('transcriptId', isString, 'a string'),
    uniprotId: isString(uniprotId) ? uniprotId : undefined,
    connectedView: read(
      'connectedView',
      isConnectedViewSpec,
      '{ assembly, loc, tracks }',
    ),
    connectedViewId: read('connectedViewId', isString, 'a string'),
    sideBySide: read('sideBySide', isBoolean, 'true or false'),
    feature: read('feature', isFeature, 'a feature object'),
    userProvidedTranscriptSequence: read(
      'userProvidedTranscriptSequence',
      isString,
      'a string',
    ),
    variant: variant === undefined ? undefined : parseLaunchVariant(variant),
  }
}

function readViewSettings(
  fields: ReadonlyMap<string, unknown>,
  warnings: string[],
): LaunchViewSettings {
  const read = fieldReader<keyof LaunchViewSettings>(
    fields,
    key => `\`${key}\``,
    warnings,
  )
  const readLayer = figureLayerReader(fields, warnings)
  const flag = (key: keyof LaunchViewSettings) =>
    read(key, isBoolean, 'true or false')
  return {
    id: read('id', isString, 'a string'),
    displayName: read('displayName', isString, 'a string'),
    height: read('height', isNumber, 'a number'),
    trackHeight: read('trackHeight', isNumber, 'a number'),
    showControls: flag('showControls'),
    showAlignment: flag('showAlignment'),
    showHighlight: flag('showHighlight'),
    showProteinTracks: flag('showProteinTracks'),
    compactTracks: flag('compactTracks'),
    showAllFeatureTracks: flag('showAllFeatureTracks'),
    zoomToBaseLevel: flag('zoomToBaseLevel'),
    autoScrollAlignment: flag('autoScrollAlignment'),
    alignmentAlgorithm: read('alignmentAlgorithm', isString, 'a string'),
    color: fields.get('color'),
    colorScheme: read('colorScheme', isString, 'a string'),
    camera: readLayer('camera', isSavedCamera, cameraProblems),
    surface: readLayer('surface', isSurface, surfaceProblems),
    distances: read(
      'distances',
      isRecordList<DistanceMeasurement>,
      "a list such as [{ a: 'A:46@NZ', b: 'A:80@NZ' }]",
    ),
    marks: read(
      'marks',
      isRecordList<ResidueMark>,
      "a list such as [{ site: 'A:248', mark: 'spheres' }]",
    ),
    silhouettes: flag('silhouettes'),
    occlusion: flag('occlusion'),
  } satisfies Record<keyof LaunchViewSettings, unknown>
}

function readStructure(
  fields: ReadonlyMap<string, unknown>,
  at: (key: StructureKey) => string,
  warnings: string[],
) {
  const read = fieldReader(fields, at, warnings)
  return {
    url: read('url', isString, 'a string'),
    data: read('data', isString, 'a string'),
    fileName: read(
      'fileName',
      (value): value is string =>
        isString(value) && isString(fields.get('data')),
      'a string beside `data`',
    ),
    uniprotId: read('uniprotId', isString, 'a string'),
    alphaFoldComplexId: read('alphaFoldComplexId', isString, 'a string'),
    pdbId: read('pdbId', isString, 'a string'),
    initialSelection: read('initialSelection', isResidueRanges, RANGES),
    initialResidues: read('initialResidues', isResidueRanges, RANGES),
    initialTranscriptResidues: read(
      'initialTranscriptResidues',
      isResidueRanges,
      RANGES,
    ),
    mappedEntityId: read('mappedEntityId', isString, 'a string'),
    pairwiseAlignment: read(
      'pairwiseAlignment',
      isPairwiseAlignment,
      '{ consensus, alns: [{ id, seq }, { id, seq }] }',
    ),
    alignmentImported: read('alignmentImported', isBoolean, 'true or false'),
    hidden: read('hidden', isBoolean, 'true or false'),
    assembly: read('assembly', isString, 'a string'),
    chains: read('chains', isStringArray, 'a list of chain ids'),
    filter: read(
      'filter',
      isRecordList<FilterPredicate>,
      "a list of predicates such as [{ field: 'residue', lte: 184 }]",
    ),
    feature: read('feature', isFeature, 'a feature object'),
    userProvidedTranscriptSequence: read(
      'userProvidedTranscriptSequence',
      isString,
      'a string',
    ),
    connectedViewId: read('connectedViewId', isString, 'a string'),
  } satisfies Record<StructureKey, unknown>
}

function namesSource(structure: LaunchStructure) {
  return (
    !!resolveStructureUrl(structure) ||
    structure.data !== undefined ||
    !!structure.uniprotId ||
    !!structure.alphaFoldComplexId
  )
}

function withUrl(structure: LaunchStructure): LaunchStructure {
  return { ...structure, url: resolveStructureUrl(structure) }
}

export interface NormalizedLaunch {
  requested: LaunchStructure[]
  settings: LaunchViewSettings
  linkage: LaunchLinkage
  warnings: string[]
  /**
   * What the `gene` lookup's AlphaFold model is to the one structure in
   * `requested`: `required` when the launch names no structure of its own,
   * `preferred` when it names only a `uniprotId`, whose model the lookup picks
   * by isoform. Absent when the launch looks no gene up or names its files.
   */
  geneModel?: 'required' | 'preferred'
}

export interface RejectedLaunch {
  error: string
  warnings: string[]
}

/**
 * The structures a launch asks for, each with its file url resolved, plus what
 * the launch said that applies to nothing. Only a launch left with no
 * structure to open is rejected; everything else is reported and opens.
 */
export function normalizeLaunch(
  launch: object,
): NormalizedLaunch | RejectedLaunch {
  const top = new Map<string, unknown>(Object.entries(launch))
  const warnings: string[] = []
  const settings = readViewSettings(top, warnings)
  const linkage = readLinkage(top, warnings)
  const known = new Set([
    ...Object.keys(settings),
    ...STRUCTURE_KEYS,
    ...LAUNCH_KEYS,
  ])
  const unknownKeys = [...top.keys()].filter(key => !known.has(key))
  if (unknownKeys.length > 0) {
    warnings.push(`ignored unknown key(s): ${unknownKeys.join(', ')}`)
  }
  const variant = top.get('variant')
  if (isString(variant) && !linkage.variant) {
    return {
      error: `\`variant\` "${variant}" is not a genome position or substitution such as ${VARIANT_SPELLING}`,
      warnings,
    }
  }
  const spelledBy = spelledTranscriptKey(linkage)
  const looksUpGene = !!linkage.gene && !spelledBy
  const noStructure = linkage.gene
    ? `the launch names no structure, and \`gene\` is not looked up beside \`${spelledBy}\``
    : 'No url, data, uniprotId, alphaFoldComplexId, pdbId or gene provided when launching protein view'

  const given = top.get('structures')
  if (given !== undefined && !Array.isArray(given)) {
    warnings.push('`structures` is not an array and was ignored')
  }
  const entries: unknown[] = Array.isArray(given) ? given : []

  if (entries.length === 0) {
    const structure = readStructure(
      new Map(
        [...top].filter(
          ([key]) =>
            isStructureKey(key) && STRUCTURE_KEY_ROLES[key] !== 'launchWide',
        ),
      ),
      key => `\`${key}\``,
      warnings,
    )
    if (namesSource(structure)) {
      return {
        requested: [withUrl(structure)],
        settings,
        linkage,
        warnings: [...warnings, ...skippedLookups(linkage)],
        geneModel:
          looksUpGene &&
          !!structure.uniprotId &&
          structure.alphaFoldComplexId === undefined &&
          structure.url === undefined &&
          structure.data === undefined
            ? 'preferred'
            : undefined,
      }
    }
    return looksUpGene
      ? {
          requested: [structure],
          settings,
          linkage,
          warnings,
          geneModel: 'required',
        }
      : { error: noStructure, warnings }
  }

  for (const key of STRUCTURE_KEYS) {
    const role = STRUCTURE_KEY_ROLES[key]
    const steersGeneLookup = key === 'uniprotId' && looksUpGene
    if (
      top.get(key) !== undefined &&
      role !== 'launchWide' &&
      !steersGeneLookup
    ) {
      warnings.push(
        `\`${key}\` beside \`structures\` ${BESIDE_STRUCTURES[role]}`,
      )
    }
  }

  const requested = entries.flatMap((entry, i) => {
    if (!isRecord(entry)) {
      warnings.push(`structures[${i}] is not an object and was omitted`)
      return []
    }
    const fields = new Map(Object.entries(entry))
    const unknownKeys = [...fields.keys()].filter(key => !isStructureKey(key))
    if (unknownKeys.length > 0) {
      warnings.push(
        `structures[${i}] ignored unknown key(s): ${unknownKeys.join(', ')}`,
      )
    }
    const structure = readStructure(
      fields,
      key => `\`structures[${i}].${key}\``,
      warnings,
    )
    if (!namesSource(structure)) {
      warnings.push(
        `structures[${i}] names no url, data, uniprotId, alphaFoldComplexId or pdbId and was omitted`,
      )
      return []
    }
    return [withUrl(structure)]
  })
  if (requested.length > 0) {
    return {
      requested,
      settings,
      linkage,
      warnings: [...warnings, ...skippedLookups(linkage)],
    }
  }
  return looksUpGene
    ? {
        requested: [{}],
        settings,
        linkage,
        warnings,
        geneModel: 'required',
      }
    : {
        error: linkage.gene
          ? noStructure
          : 'no entry of `structures` names a url, data, uniprotId, alphaFoldComplexId or pdbId',
        warnings,
      }
}
