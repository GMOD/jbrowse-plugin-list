// JBrowse's per-view readiness hook: while a view's `showLoading` is true the
// app-level ready marker, the capture tools and jb.waitReady all report
// "loading", so a wait lands after Molstar has the structure rather than on a
// guessed timer. A minimized view never mounts its body, so its structures
// never load and it must not count; a view that errored is finished.
export function showLoading(view: {
  minimized: boolean
  error: unknown
  structures: { loadedToMolstar: boolean }[]
}) {
  return (
    !view.minimized &&
    !view.error &&
    view.structures.some(s => !s.loadedToMolstar)
  )
}
