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
// location is `packageName` + `umdPath`; all served URLs are constructed from
// these plus a version, so nothing in the pipeline parses URLs.
export interface SourcePlugin {
  name: string
  packageName: string
  authors: string[]
  description: string
  location: string
  plug_n_play?: number
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

// Published v1 manifest entry (legacy flat shape) — what existing JBrowse clients
// expect from https://jbrowse.org/plugin-store/plugins.json.
export interface V1Plugin {
  name: string
  authors: string[]
  description: string
  location: string
  plug_n_play?: number
  url: string
  license: string
  image?: string
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

// Legacy, unversioned artifact URL used by the v1 manifest. Kept stable so
// existing clients keep fetching the same path they always have; v2 uses the
// version-pinned `rehostedUrl` instead.
export function legacyRehostedUrl(packageName: string, umdPath: string) {
  return `${REHOST_BASE}${packageName}/${umdPath}`
}

export function subresourceIntegrity(filePath: string) {
  const digest = crypto
    .createHash('sha384')
    .update(fs.readFileSync(filePath))
    .digest('base64')
  return `sha384-${digest}`
}
