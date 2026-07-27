import crypto from 'crypto'
import fs from 'fs'

// Base URL where rehosted, version-pinned plugin artifacts are served from. The
// path layout mirrors `dist/` so that `aws s3 sync dist` publishes to it.
export const REHOST_BASE = 'https://jbrowse.org/plugins/'

// A plugin version's compatibility with a range of JBrowse versions. `pluginVersion`
// is the published npm version; `jbrowseRange` is a semver range of supported JBrowse
// versions resolved by the consumer at install time.
export interface SourceVersion {
  pluginVersion: string
  jbrowseRange: string
}

// Hand-edited source manifest entry (plugins.json). The authoritative bundle
// location is `packageName` + one of `umdPath`/`esmPath`; all served URLs are
// constructed from these plus a version, so nothing in the pipeline parses URLs.
export interface SourcePlugin {
  name: string
  packageName: string
  authors: string[]
  description: string
  location: string
  plug_n_play?: number
  // Exactly one of these. `umdPath` is a classic UMD bundle loaded via <script>
  // and pinned with subresource integrity. `esmPath` is a native ES module
  // loaded via import(); it carries no integrity hash (dynamic import can't) and
  // resolves its own code-split chunks relative to its url, so the whole package
  // `dist/` is rehosted together (which it already is — the tarball is extracted
  // wholesale).
  umdPath?: string
  esmPath?: string
  license: string
  image?: string
  // Optional explicit version pins, listed oldest-to-newest. When omitted the
  // download step tracks the npm `latest` tag with an unrestricted range.
  versions?: SourceVersion[]
}

// A source entry names its bundle under exactly one of umdPath/esmPath. Returns
// which kind it is plus the in-package path, and rejects a malformed entry (both
// or neither) loudly rather than silently picking one.
export function bundleLocation(plugin: SourcePlugin) {
  if (plugin.umdPath !== undefined && plugin.esmPath !== undefined) {
    throw new Error(
      `${plugin.packageName}: set only one of umdPath / esmPath, not both`,
    )
  } else if (plugin.esmPath !== undefined) {
    return { kind: 'esm' as const, path: plugin.esmPath }
  } else if (plugin.umdPath !== undefined) {
    return { kind: 'umd' as const, path: plugin.umdPath }
  } else {
    throw new Error(`${plugin.packageName}: needs a umdPath or esmPath`)
  }
}

export interface SourceManifest {
  plugins: SourcePlugin[]
}

// One resolved + downloaded version. A UMD build carries `url` + `integrity`; an
// ESM build carries `esmUrl` and no integrity (dynamic import has no SRI).
export interface BuiltVersion {
  pluginVersion: string
  jbrowseRange: string
  url?: string
  integrity?: string
  esmUrl?: string
}

// The url-bearing fields of a built version, picked by kind. Spread onto a
// V2Plugin / version entry so a UMD build emits url+integrity and an ESM build
// emits esmUrl — matching what the JBrowse consumer's definitionFrom reads.
export function builtUrlFields(v: BuiltVersion) {
  return v.esmUrl !== undefined
    ? { esmUrl: v.esmUrl }
    : { url: v.url, integrity: v.integrity }
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
  plug_n_play?: number
  license: string
  image?: string
  // UMD entries carry url + integrity; ESM entries carry esmUrl (no SRI).
  url?: string
  integrity?: string
  esmUrl?: string
  versions: BuiltVersion[]
}

export function rehostedUrl(
  packageName: string,
  version: string,
  umdPath: string,
) {
  return `${REHOST_BASE}${packageName}/${version}/${umdPath}`
}

// Explicit "always latest" url: a stable, version-agnostic path that always
// serves the newest published version (the build copies the latest version into
// a `latest/` dir). Must be served no-cache (see the `upload` script) since its
// target changes on each release. Safe for self-contained bundles; a code-split
// plugin (e.g. protein3d, which lazy-loads a `molstar-chunk.js` sibling) should
// be referenced by a pinned `rehostedUrl` instead, so its bundle and sidecar
// chunk stay a matched, immutable set.
export function latestRehostedUrl(packageName: string, umdPath: string) {
  return `${REHOST_BASE}${packageName}/latest/${umdPath}`
}

export function subresourceIntegrity(filePath: string) {
  const digest = crypto
    .createHash('sha384')
    .update(fs.readFileSync(filePath))
    .digest('base64')
  return `sha384-${digest}`
}
