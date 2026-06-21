#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { createGunzip } from 'zlib'

import * as tar from 'tar'

import { rehostedUrl, subresourceIntegrity } from './manifest-types.ts'
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

  const pendingWrites: Promise<void>[] = []

  return new Promise((resolve, reject) => {
    // response.body is ReadableStream<Uint8Array> (Web API) — cast needed for Node/DOM boundary
    Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0])
      .pipe(createGunzip())
      .pipe(
        tar.t({
          onentry: entry => {
            if (entry.path.startsWith('package/')) {
              const relativePath = entry.path.slice('package/'.length)
              if (relativePath && entry.type !== 'Directory') {
                const destPath = path.join(destDir, relativePath)
                fs.mkdirSync(path.dirname(destPath), { recursive: true })
                const writeStream = fs.createWriteStream(destPath)
                pendingWrites.push(
                  new Promise<void>((resolveWrite, rejectWrite) => {
                    writeStream.on('finish', resolveWrite)
                    writeStream.on('error', rejectWrite)
                  }),
                )
                entry.pipe(writeStream)
              }
            }
          },
        }),
      )
      .on('finish', () => {
        Promise.all(pendingWrites).then(() => resolve(), reject)
      })
      .on('error', reject)
  })
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

// Downloads one version into dist/<packageName>/<version>/ (append-only: an
// existing, complete extraction is reused) and returns its served URL + hash.
async function buildVersion(
  plugin: SourcePlugin,
  version: SourceVersion,
  metadata: NpmPackageMetadata,
): Promise<BuiltVersion> {
  const { packageName, umdPath } = plugin
  const { pluginVersion } = version
  const versionDir = path.join(outputDir, packageName, pluginVersion)
  const bundlePath = path.join(versionDir, umdPath)

  if (fs.existsSync(bundlePath)) {
    console.log(`✓ ${packageName}@${pluginVersion} already present`)
  } else {
    const release = metadata.versions[pluginVersion]
    if (!release) {
      throw new Error(`${packageName}: version ${pluginVersion} not on npm`)
    }
    console.log(`  Downloading ${packageName}@${pluginVersion}...`)
    await downloadAndExtractTarball(release.dist.tarball, versionDir)
    if (!fs.existsSync(bundlePath)) {
      throw new Error(
        `${packageName}@${pluginVersion}: umdPath "${umdPath}" not found in package`,
      )
    }
    console.log(`✓ Downloaded ${packageName}@${pluginVersion}`)
  }

  return {
    pluginVersion,
    jbrowseRange: version.jbrowseRange,
    url: rehostedUrl(packageName, pluginVersion, umdPath),
    integrity: subresourceIntegrity(bundlePath),
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
      const latest = versions[versions.length - 1].pluginVersion
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
