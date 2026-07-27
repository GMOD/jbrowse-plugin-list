#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'

import { compareVersions } from 'compare-versions'
import * as tar from 'tar'

import {
  bundleLocation,
  rehostedUrl,
  subresourceIntegrity,
} from './manifest-types.ts'
import type {
  BuildManifest,
  BuiltPlugin,
  BuiltVersion,
  SourceManifest,
  SourcePlugin,
  SourceVersion,
} from './manifest-types.ts'

// Output dir mirrors the served path layout: dist/<packageName>/<version>/...
// Overridable so the pipeline can be exercised without touching the committed dist.
const outputDir = process.env.PLUGIN_DIST_DIR
  ? path.resolve(process.env.PLUGIN_DIST_DIR)
  : path.join(import.meta.dirname, 'dist')

const buildManifestPath = process.env.PLUGIN_BUILD_MANIFEST
  ? path.resolve(process.env.PLUGIN_BUILD_MANIFEST)
  : path.join(import.meta.dirname, 'build-manifest.json')

// Optional CLI args restrict the run to specific package names.
const only = new Set(process.argv.slice(2))

interface NpmPackageMetadata {
  'dist-tags': { latest: string }
  versions: Record<string, { dist: { tarball: string } }>
}

const { plugins } = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, 'plugins.json'), 'utf8'),
) as SourceManifest

async function fetchPackageMetadata(
  packageName: string,
): Promise<NpmPackageMetadata> {
  const response = await fetch(`https://registry.npmjs.org/${packageName}`)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch package metadata: ${response.status} ${response.statusText}`,
    )
  }
  return response.json() as Promise<NpmPackageMetadata>
}

async function downloadAndExtractTarball(
  tarballUrl: string,
  destDir: string,
): Promise<void> {
  const response = await fetch(tarballUrl)
  if (!response.ok) {
    throw new Error(
      `Failed to download tarball: ${response.status} ${response.statusText}`,
    )
  }
  if (!response.body) {
    throw new Error('No response body')
  }
  fs.mkdirSync(destDir, { recursive: true })
  // tar auto-detects the gzip; strip:1 drops npm's leading `package/` segment.
  // response.body is ReadableStream<Uint8Array> (Web API) — cast needed for Node/DOM boundary.
  await pipeline(
    Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]),
    tar.x({ cwd: destDir, strip: 1 }),
  )
}

// The set of versions to publish for a plugin: explicit pins when declared,
// otherwise the single npm `latest`.
function resolveTargetVersions(
  plugin: SourcePlugin,
  metadata: NpmPackageMetadata,
): SourceVersion[] {
  if (plugin.versions && plugin.versions.length > 0) {
    return plugin.versions
  }
  return [{ pluginVersion: metadata['dist-tags'].latest, jbrowseRange: '*' }]
}

// Newest by semver — never by array position, so an author listing `versions`
// out of order can't desync which build is served as `latest` from the version
// the consumer resolves (it sorts by semver too).
function newestVersion(versions: BuiltVersion[]): BuiltVersion {
  return [...versions].sort((a, b) =>
    compareVersions(b.pluginVersion, a.pluginVersion),
  )[0]
}

// Extract a tarball into versionDir atomically: files land in a `.partial`
// sibling and the dir is renamed into place only once the entry bundle is
// confirmed present. So a versionDir is either absent or a complete package —
// the entry and any lazily-loaded sidecar chunks (protein3d's
// `molstar-chunk.js`, an ESM plugin's `chunks/`) can never be split across a
// half-written extraction that the append-only skip below would then reuse.
async function downloadVersionAtomic(
  tarballUrl: string,
  versionDir: string,
  bundleFile: string,
  label: string,
): Promise<void> {
  const partialDir = `${versionDir}.partial`
  fs.rmSync(partialDir, { recursive: true, force: true })
  await downloadAndExtractTarball(tarballUrl, partialDir)
  if (!fs.existsSync(path.join(partialDir, bundleFile))) {
    fs.rmSync(partialDir, { recursive: true, force: true })
    throw new Error(`${label}: bundle "${bundleFile}" not found in package`)
  }
  fs.renameSync(partialDir, versionDir)
}

// Downloads one version into dist/<packageName>/<version>/ (append-only: an
// existing extraction is reused) and returns its served URL + hash.
async function buildVersion(
  plugin: SourcePlugin,
  version: SourceVersion,
  metadata: NpmPackageMetadata,
): Promise<BuiltVersion> {
  const { packageName } = plugin
  const { kind, path: bundleFile } = bundleLocation(plugin)
  const { pluginVersion } = version
  const versionDir = path.join(outputDir, packageName, pluginVersion)
  const label = `${packageName}@${pluginVersion}`

  if (fs.existsSync(versionDir)) {
    console.log(`✓ ${label} already present`)
  } else {
    const release = metadata.versions[pluginVersion]
    if (!release) {
      throw new Error(`${packageName}: version ${pluginVersion} not on npm`)
    }
    console.log(`  Downloading ${label}...`)
    await downloadVersionAtomic(
      release.dist.tarball,
      versionDir,
      bundleFile,
      label,
    )
    console.log(`✓ Downloaded ${label}`)
  }

  const rehosted = rehostedUrl(packageName, pluginVersion, bundleFile)
  // ESM entries carry no subresource integrity (dynamic import has no SRI); UMD
  // entries are hashed so JBrowse can enforce integrity on the <script> load.
  return {
    pluginVersion,
    jbrowseRange: version.jbrowseRange,
    ...(kind === 'esm'
      ? { esmUrl: rehosted }
      : {
          url: rehosted,
          integrity: subresourceIntegrity(path.join(versionDir, bundleFile)),
        }),
  }
}

// Mirror a plugin's newest version into a stable `latest/` dir so it's served at
// the version-agnostic `latestRehostedUrl`. Rebuilt from scratch each run so a
// version with fewer files doesn't leave stale ones behind. Git dedups the
// copied blobs against the versioned dir (same content, same hash). The upload
// step compares by content hash (rclone --checksum), so the fresh mtimes here
// don't trigger needless re-uploads.
function copyToLatest(packageName: string, version: string) {
  const versionDir = path.join(outputDir, packageName, version)
  const latestDir = path.join(outputDir, packageName, 'latest')
  fs.rmSync(latestDir, { recursive: true, force: true })
  fs.cpSync(versionDir, latestDir, { recursive: true })
}

async function downloadPlugins(): Promise<void> {
  const built: BuiltPlugin[] = []

  for (const plugin of plugins) {
    if (only.size > 0 && !only.has(plugin.packageName)) {
      continue
    }
    try {
      console.log(`Fetching ${plugin.name}...`)
      const metadata = await fetchPackageMetadata(plugin.packageName)
      const targets = resolveTargetVersions(plugin, metadata)
      const versions: BuiltVersion[] = []
      for (const target of targets) {
        versions.push(await buildVersion(plugin, target, metadata))
      }
      const latest = newestVersion(versions).pluginVersion
      copyToLatest(plugin.packageName, latest)
      built.push({
        packageName: plugin.packageName,
        latest,
        versions,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`✗ Failed ${plugin.name}: ${message}`)
    }
  }

  const manifest: BuildManifest = { plugins: built }
  fs.writeFileSync(buildManifestPath, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`\nWrote ${buildManifestPath} (${built.length} plugins)`)
}

downloadPlugins().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
