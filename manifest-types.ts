import crypto from 'crypto'
import fs from 'fs'

// Base URL where rehosted, version-pinned plugin artifacts are served from. The
// path layout mirrors `dist/`, so publishing is a straight copy of the tree (see
// the `upload` script). It must stay a *copy* and never a sync: `dist/` holds
// only the currently-published versions, while S3 holds every version ever
// published, and those older objects are exactly what installed plugins and
// saved configs point at. A sync would delete them.
export const REHOST_BASE = 'https://jbrowse.org/plugins/'

// A plugin version's compatibility with a range of JBrowse versions. `pluginVersion`
// is the published npm version; `jbrowseRange` is a semver range of supported JBrowse
// versions resolved by the consumer at install time.
export interface SourceVersion {
  pluginVersion: string
  jbrowseRange: string
}

// Hand-edited source manifest entry (plugins.json). The authoritative bundle
// location is `packageName` + `umdPath`; all served URLs are constructed from
// these plus a version, so nothing in the pipeline parses URLs.
// Free-form labels shown and filtered on in the plugin store. Deliberately not
// an enum: the vocabulary is data, so a new axis (a setup level, a data type, a
// domain) is a plugins.json edit rather than a schema change in three repos.
// Replaced the old numeric `plug_n_play` 0/1/2 scale, which needed a legend that
// was never written down and could only express one axis.
export type PluginTag = string

export interface SourcePlugin {
  name: string
  packageName: string
  authors: string[]
  description: string
  location: string
  tags?: PluginTag[]
  umdPath: string
  license: string
  image?: string
  // Optional explicit version pins, listed oldest-to-newest. When omitted the
  // download step tracks the npm `latest` tag with an unrestricted range.
  versions?: SourceVersion[]
}

export interface SourceManifest {
  plugins: SourcePlugin[]
}

// One resolved + downloaded version, with its immutable URL and integrity hash.
export interface BuiltVersion {
  pluginVersion: string
  jbrowseRange: string
  url: string
  integrity: string
}

// Intermediate build output (build-manifest.json) bridging download and generate.
// `latest` is the version a client without range support / fallback should use.
export interface BuiltPlugin {
  packageName: string
  latest: string
  versions: BuiltVersion[]
}

export interface BuildManifest {
  plugins: BuiltPlugin[]
}

// Published v2 manifest entry — served at https://jbrowse.org/plugin-store/v2/plugins.json.
// Top-level `url`/`integrity` are the `latest` fallback; `versions` drives semver
// range selection by the consumer.
export interface V2Plugin {
  name: string
  packageName: string
  authors: string[]
  description: string
  location: string
  tags?: PluginTag[]
  license: string
  image?: string
  url: string
  integrity: string
  versions: BuiltVersion[]
}

export function rehostedUrl(
  packageName: string,
  version: string,
  umdPath: string,
) {
  return `${REHOST_BASE}${packageName}/${version}/${umdPath}`
}

// The whole `latest/` prefix for a plugin. Everything under it belongs to one
// build, which is what lets a consumer serve or intercept a code-split plugin's
// sidecar chunks alongside its umd entry point.
export function latestRehostedPrefix(packageName: string) {
  return `${REHOST_BASE}${packageName}/latest/`
}

// Explicit "always latest" url: a stable, version-agnostic path that always
// serves the newest published version (the build copies the latest version into
// a `latest/` dir). Must be served no-cache (see the `upload` script) since its
// target changes on each release. Safe for self-contained bundles; a code-split
// plugin (e.g. protein3d, which lazy-loads a `molstar-chunk.js` sibling) should
// be referenced by a pinned `rehostedUrl` instead, so its bundle and sidecar
// chunk stay a matched, immutable set.
export function latestRehostedUrl(packageName: string, umdPath: string) {
  return `${latestRehostedPrefix(packageName)}${umdPath}`
}

export function subresourceIntegrity(filePath: string) {
  const digest = crypto
    .createHash('sha384')
    .update(fs.readFileSync(filePath))
    .digest('base64')
  return `sha384-${digest}`
}
