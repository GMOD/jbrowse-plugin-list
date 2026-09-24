// Trigger a browser download of `blob` as `filename`. Mirrors the anchor-download
// path of @jbrowse/core's saveAs: the deferred revoke avoids canceling the
// download before the browser has read the blob (the read is async in some
// browsers). Inlined until a published core release exports saveAs from its util.
export function saveAs(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  anchor.click()
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 40000)
}

function asObjArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : []
}

// Merges two lists of config objects by an id key, with `overrides` winning so
// a session-scoped track/assembly that shadows a config one (same id) replaces
// it rather than duplicating.
function mergeById(
  base: Record<string, unknown>[],
  overrides: Record<string, unknown>[],
  key: string,
): Record<string, unknown>[] {
  const merged = new Map<unknown, Record<string, unknown>>()
  for (const item of [...base, ...overrides]) {
    merged.set(item[key], item)
  }
  return [...merged.values()]
}

// Builds a desktop `.jbrowse` snapshot (a config plus a defaultSession) from a
// web root config and its live session. Session-scoped tracks/assemblies are
// hoisted into the config arrays so they open as first-class config entries in
// desktop; the rest of the session becomes the defaultSession. Web sessions are
// always UriLocation-based, so the result is fully portable to desktop.
export function toDesktopSnapshot(
  jbrowse: Record<string, unknown>,
  session: Record<string, unknown>,
): Record<string, unknown> {
  const { sessionTracks, sessionAssemblies, ...defaultSession } = session
  return {
    ...jbrowse,
    tracks: mergeById(
      asObjArray(jbrowse.tracks),
      asObjArray(sessionTracks),
      'trackId',
    ),
    assemblies: mergeById(
      asObjArray(jbrowse.assemblies),
      asObjArray(sessionAssemblies),
      'name',
    ),
    defaultSession,
  }
}
