// JBrowse's per-view readiness hook: while a view's `showLoading` is true the
// app-level ready marker, the capture tools and jb.waitReady all report
// "loading", so a wait lands once every structure is drawn, aligned and
// SIFTS-mapped rather than on a guessed timer. The view's own
// `protein-view-ready` test id reads the same value. A minimized view never
// mounts its body, so its structures never load and it must not count; a view
// that errored is finished, and so is a structure that failed — settled is not
// the same as shown, so a check that a session really came up reads each
// structure's `error` alongside this.
export function showLoading(view) {
    return !view.minimized && !view.error && view.structures.some(s => s.loading);
}
