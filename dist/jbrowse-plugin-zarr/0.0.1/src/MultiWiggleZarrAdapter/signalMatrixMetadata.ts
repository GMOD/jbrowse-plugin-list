// The JBrowse-specific attributes a signal-matrix Zarr store carries on its
// root group, under the `jbrowse_signal_matrix` key. Everything the adapter
// needs to turn a genomic region into an array selection lives here, so opening
// a store costs one metadata read and no per-sample bookkeeping.
//
// Written by scripts/build_signal_zarr.ts. Keep the two in sync: this parser is
// the only reader, and it rejects rather than guesses.

export interface SignalMatrixSample {
  name: string
  group?: string
  color?: string
}

// Where one reference sequence sits on a level's flat bin axis. `start` is the
// genomic coordinate of the level's first bin for this refName, so a store can
// cover a single window of one chromosome without pretending the rest exists.
export interface SignalMatrixRefSpan {
  start: number
  binOffset: number
  numBins: number
}

// `minPath`/`maxPath` name sibling arrays holding the min and max of the finer
// bins each bin of `path` averages, the same thing a BigWig zoom record carries
// alongside its mean. They are optional and always travel together: the finest
// level has nothing below it to summarize, and stores written before v2 have
// none at all, so their presence is the feature test rather than `version`.
export interface SignalMatrixLevel {
  path: string
  binSize: number
  refs: Record<string, SignalMatrixRefSpan>
  minPath?: string
  maxPath?: string
}

export interface SignalMatrixMetadata {
  version: number
  samples: SignalMatrixSample[]
  levels: SignalMatrixLevel[]
}

export const SIGNAL_MATRIX_ATTRIBUTE = 'jbrowse_signal_matrix'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readNumber(value: unknown, where: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${where} must be a finite number`)
  }
  return value
}

function readString(value: unknown, where: string) {
  if (typeof value !== 'string' || !value) {
    throw new Error(`${where} must be a non-empty string`)
  }
  return value
}

function readOptionalString(value: unknown, where: string) {
  return value === undefined ? undefined : readString(value, where)
}

function readSample(value: unknown, index: number): SignalMatrixSample {
  const where = `samples[${index}]`
  if (typeof value === 'string') {
    return { name: value }
  }
  if (!isRecord(value)) {
    throw new Error(`${where} must be a string or an object`)
  }
  return {
    name: readString(value.name, `${where}.name`),
    group: readOptionalString(value.group, `${where}.group`),
    color: readOptionalString(value.color, `${where}.color`),
  }
}

function readRefs(value: unknown, where: string) {
  if (!isRecord(value)) {
    throw new Error(`${where} must be an object keyed by refName`)
  }
  return Object.fromEntries(
    Object.entries(value).map(([refName, span]) => {
      const at = `${where}.${refName}`
      if (!isRecord(span)) {
        throw new Error(`${at} must be an object`)
      }
      return [
        refName,
        {
          start: readNumber(span.start, `${at}.start`),
          binOffset: readNumber(span.binOffset, `${at}.binOffset`),
          numBins: readNumber(span.numBins, `${at}.numBins`),
        },
      ]
    }),
  )
}

function readLevel(value: unknown, index: number): SignalMatrixLevel {
  const where = `levels[${index}]`
  if (!isRecord(value)) {
    throw new Error(`${where} must be an object`)
  }
  const minPath = readOptionalString(value.minPath, `${where}.minPath`)
  const maxPath = readOptionalString(value.maxPath, `${where}.maxPath`)
  // Rejected rather than half-honored: with one of the pair the display would
  // draw a whisker against the mean on the other side, which reads as a real
  // asymmetry in the data instead of a missing array.
  if ((minPath === undefined) !== (maxPath === undefined)) {
    throw new Error(
      `${where} has ${minPath ? 'minPath' : 'maxPath'} without the other; a summary level needs both`,
    )
  }
  return {
    path: readString(value.path, `${where}.path`),
    binSize: readNumber(value.binSize, `${where}.binSize`),
    refs: readRefs(value.refs, `${where}.refs`),
    minPath,
    maxPath,
  }
}

export function parseSignalMatrixMetadata(
  attributes: unknown,
): SignalMatrixMetadata {
  if (!isRecord(attributes)) {
    throw new Error('zarr group has no attributes')
  }
  const meta = attributes[SIGNAL_MATRIX_ATTRIBUTE]
  if (!isRecord(meta)) {
    throw new Error(
      `zarr group is missing its "${SIGNAL_MATRIX_ATTRIBUTE}" attribute — this store was not written for a MultiWiggleZarrAdapter`,
    )
  }
  const { version, samples, levels } = meta
  if (!Array.isArray(samples) || samples.length === 0) {
    throw new Error(
      `${SIGNAL_MATRIX_ATTRIBUTE}.samples must be a non-empty array`,
    )
  }
  if (!Array.isArray(levels) || levels.length === 0) {
    throw new Error(
      `${SIGNAL_MATRIX_ATTRIBUTE}.levels must be a non-empty array`,
    )
  }
  return {
    version: readNumber(version, `${SIGNAL_MATRIX_ATTRIBUTE}.version`),
    samples: samples.map((s, i) => readSample(s, i)),
    // finest first, so level selection is a scan from the coarse end
    levels: levels
      .map((l, i) => readLevel(l, i))
      .sort((a, b) => a.binSize - b.binSize),
  }
}

// The coarsest level whose bins are still no wider than one screen pixel, so a
// zoomed-out view reads a small pyramid level instead of every 1kb bin. Falls
// back to the finest level when even that is coarser than a pixel (zoomed in),
// which is the normal case at gene scale.
export function pickLevel(levels: SignalMatrixLevel[], bpPerPx: number) {
  const finest = levels[0]!
  const usable = levels.filter(
    l => l.binSize <= Math.max(bpPerPx, finest.binSize),
  )
  return usable.at(-1) ?? finest
}
