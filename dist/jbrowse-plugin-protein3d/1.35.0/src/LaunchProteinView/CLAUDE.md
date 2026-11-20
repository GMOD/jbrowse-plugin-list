# LaunchProteinView

Why, with the measurements: `agent-docs/reference/protein-1d-view.md`.

- Open a 1D view's tracks with `launchTrack` and an inline config; `showTrack`
  returns undefined and defers while the display's state model is lazy.
- Keep the UniProt feature types as sections of one track: a page gets 16 WebGL2
  contexts, and a track per type wedges it blank.
- Prefix a 1D view's track ids with the view's id; a session tree cannot hold
  one trackId twice.
- Resolve the right-clicked gene with `fetchFullFeature`: the display's render
  payload holds no `Feature` objects.
