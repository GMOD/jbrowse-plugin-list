import type { FileLocation } from '@jbrowse/core/util'

export const SEGMENTS_SUFFIX = '.segs.bed.gz'
export const WALKS_SUFFIX = '.walks.bed.gz'

// The reference sample `gfa-to-tabix --walks` names a walk file after:
// GRCh38 in `chr22.GRCh38.walks.bed.gz`
export function walkFileSample(loc: FileLocation) {
  const name = locationName(loc).replace(/^.*[/\\]/, '')
  if (!name.endsWith(WALKS_SUFFIX)) {
    return undefined
  }
  const prefix = name.slice(0, -WALKS_SUFFIX.length)
  const dot = prefix.lastIndexOf('.')
  return dot === -1 ? undefined : prefix.slice(dot + 1) || undefined
}

// A schema's unset file slot defaults to an empty uri
export function locationIsSet(loc: FileLocation) {
  return !('uri' in loc) || loc.uri !== ''
}

// Whether a location as a config snapshot writes it names a file
export function snapshotNamesFile(location: unknown) {
  return (
    typeof location === 'object' &&
    location !== null &&
    Object.entries(location).some(
      ([key, value]) =>
        ['uri', 'localPath', 'blobId'].includes(key) &&
        typeof value === 'string' &&
        value !== '',
    )
  )
}

// A url's query string (a presigned signature, a token) follows the file name
export function splitUri(uri: string) {
  const end = uri.search(/[?#]/)
  return end === -1
    ? { name: uri, query: '' }
    : { name: uri.slice(0, end), query: uri.slice(end) }
}

export function locationName(loc: FileLocation) {
  return 'uri' in loc
    ? splitUri(loc.uri).name
    : 'localPath' in loc
      ? loc.localPath
      : loc.name
}

// A file picked in the browser comes without the directory it sat in
export function readsSiblings(loc: FileLocation) {
  return 'uri' in loc || 'localPath' in loc
}

export function renamed(loc: FileLocation, rename: (name: string) => string) {
  if ('uri' in loc) {
    const { name, query } = splitUri(loc.uri)
    return { ...loc, uri: rename(name) + query }
  } else if ('localPath' in loc) {
    return { ...loc, localPath: rename(loc.localPath) }
  } else {
    throw new Error(
      `${loc.name} was picked in the browser, which reads no file beside it; open it by URL`,
    )
  }
}
