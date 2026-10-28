// JBrowse's per-view readiness hook: while a view's `showLoading` is true the
// app-level ready marker, the capture tools and jb.waitReady all report
// "loading", so a wait lands once every structure is drawn, aligned,
// SIFTS-mapped, its color field's values placed and the cartoon painted with
// them, rather than on a guessed timer. The view's own `protein-view-ready`
// test id reads the same value. A structure's own `loading` leaves the values
// out, so a selection and the camera do not wait on a slow AlphaMissense or
// track fetch; a capture does, since a cartoon still in Mol*'s chain colors
// under the right legend is not the picture. A minimized view never mounts its
// body, so its structures never load and it must not count; a view that errored
// is finished, and so is a structure that failed — settled is not the same as
// shown, so a check that a session really came up reads each structure's
// `error` alongside this.
export function showLoading(view: {
  minimized: boolean
  error: unknown
  paintsPending: number
  structures: { loading: boolean; variantEffectsPending: boolean }[]
}) {
  return (
    !view.minimized &&
    !view.error &&
    (view.paintsPending > 0 ||
      view.structures.some(s => s.loading || s.variantEffectsPending))
  )
}
