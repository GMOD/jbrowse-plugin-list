# jbrowse-plugin-hubs

Resolves a genome a JBrowse session names but does not hold, from the configs
[jb2hubs](https://github.com/GMOD/jb2hubs) hosts at `jbrowse.org/ucsc/` and
`jbrowse.org/hubs/genark/`.

- An unknown assembly name becomes a `JB2TrackHubConnection` to its hosted
  config (`Core-handleUnrecognizedAssembly`).
- A multi-way synteny lane gets its assembly config and gene track without a
  connection (`Core-describeAssemblies`).
- jbrowse-web gets Tools > Download desktop session (.jbrowse).

## Hosts

Each release is an ES module for JBrowse 5, built against `v5.0.0-beta.18`
(`scripts/check-host-floor.mjs`). A JBrowse 5 host resolves the `Hubs` store
entry a jb2hubs config names and loads the newest release.

JBrowse 4, web and desktop, keeps 1.0.18 for good. It ignores the store entry
and loads the config's `latest/dist/jbrowse-plugin-hubs.umd.production.min.js`,
and the store upload only adds and replaces files, so that url serves 1.0.18 for
as long as no release carries a file of that name (jbrowse-plugin-list ADR
0009). `pnpm host-compat` refuses a `dist/` that holds one.

## Releasing

`pnpm version <patch|minor|major>` publishes to npm from CI. The first ESM
release also needs the `Hubs` entry in jbrowse-plugin-list's `plugins.json` to
trade `umdPath` for
`"esmPath": "dist/jbrowse-plugin-hubs.esm.js", "jbrowseRange": ">=5.0.0"`,
before `pnpm update-plugins`.
