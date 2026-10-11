import type { FileLocation } from '@jbrowse/core/util'

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
