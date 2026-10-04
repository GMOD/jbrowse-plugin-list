import type { HostWindow } from '../GraphGenomeView/host'

// A cut refused for its node count: the GBZ adapter's own error, marked
// regionTooLarge so core shows it as a zoom-in notice, or gbz-base's when it
// reaches the display unwrapped
export function isNodeLimitError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === 'NodeLimitError' ||
      (error as { regionTooLarge?: unknown }).regionTooLarge === true ||
      /reads more than nodeLimit|^Subgraph size limit of \d+ nodes exceeded/.test(
        error.message,
      ))
  )
}

// Where a cut came back over its node limit. The graph is as dense as that
// only near it, so it stands for windows as wide or wider on the same contig
// within one window-width of it.
export interface DenseWindow {
  refName: string
  assemblyName: string
  start: number
  end: number
}

export function denseCovers(dense: DenseWindow | undefined, seen: HostWindow) {
  if (
    dense?.refName !== seen.refName ||
    dense.assemblyName !== seen.assemblyName
  ) {
    return false
  }
  const span = dense.end - dense.start
  return (
    seen.end - seen.start >= span &&
    seen.end > dense.start - span &&
    seen.start < dense.end + span
  )
}
