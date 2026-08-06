#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { parseArgs } from 'node:util'

import { compareVersions } from 'compare-versions'

import {
  downloadVersionAtomic,
  fetchPackageMetadata,
  type NpmPackageMetadata,
} from './npm-fetch.ts'
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

// Optional positional args restrict the run to specific package names.
const { values, positionals } = parseArgs({
  options: {
    'allow-failures': { type: 'boolean', default: false },
    'no-prune': { type: 'boolean', default: false },
  },
  allowPositionals: true,
})
const only = new Set(positionals)

const { plugins } = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, 'plugins.json'), 'utf8'),
) as SourceManifest

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

// Downloads one version into dist/<packageName>/<version>/ (an existing
// extraction is reused, never re-downloaded) and returns its served URL + hash.
async function buildVersion(
  plugin: SourcePlugin,
  version: SourceVersion,
  metadata: NpmPackageMetadata,
): Promise<BuiltVersion> {
  const { packageName, umdPath } = plugin
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
      umdPath,
      label,
    )
    console.log(`✓ Downloaded ${label}`)
  }

  return {
    pluginVersion,
    jbrowseRange: version.jbrowseRange,
    url: rehostedUrl(packageName, pluginVersion, umdPath),
    integrity: subresourceIntegrity(path.join(versionDir, umdPath)),
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

// Anything this run did not rebuild keeps its previous manifest entry, which
// covers two cases that would otherwise silently shrink the published store:
//
//   - a filtered run (`… jbrowse-plugin-msaview`) touches one package, so
//     without this the next `generate` writes a v2 manifest of exactly one
//     plugin and drops the other sixteen;
//   - a plugin that failed to download keeps its last good version rather than
//     vanishing. Its bundle is still on S3 and still works, so carrying it
//     forward is both safe and the honest result: npm was unreachable for
//     thirty seconds, which is not a reason to unpublish a plugin.
//
// Emitted in plugins.json order so the manifest diff stays readable.
function mergeWithPrevious(built: BuiltPlugin[]): BuiltPlugin[] {
  const byName = new Map(built.map(p => [p.packageName, p]))
  if (fs.existsSync(buildManifestPath)) {
    const previous = JSON.parse(
      fs.readFileSync(buildManifestPath, 'utf8'),
    ) as BuildManifest
    for (const p of previous.plugins) {
      if (!byName.has(p.packageName)) {
        byName.set(p.packageName, p)
      }
    }
  }
  return plugins.flatMap(p => {
    const found = byName.get(p.packageName)
    return found ? [found] : []
  })
}

// `dist/` is a staging area for the upload, not an archive: S3 keeps every
// version ever published and the upload never deletes, so a version dir the
// manifest no longer names is a second copy of an immutable public artifact.
// Drop it, or the tree grows without bound (protein3d alone is ~23M a release)
// and the retention rule the docs describe stops being true after one nightly.
// `fetch-version.ts` brings any of them back, verified against S3.
//
// Keeps every version the manifest names — a plugin pinning several `versions`
// keeps all of them — plus `latest/`. Two things are deliberately never touched:
// directories that don't look like a version (the legacy v1 flat tree,
// `dist/`, `src/`, `package.json`), and packages absent from the manifest
// (retired ones like icgc, whose artifacts are still served), since nothing
// here knows what those should keep.
function pruneUnpublished(manifest: BuiltPlugin[]): string[] {
  const removed: string[] = []
  for (const plugin of manifest) {
    const pkgDir = path.join(outputDir, plugin.packageName)
    if (!fs.existsSync(pkgDir)) {
      continue
    }
    const keep = new Set([
      'latest',
      ...plugin.versions.map(v => v.pluginVersion),
    ])
    for (const entry of fs.readdirSync(pkgDir, { withFileTypes: true })) {
      if (
        entry.isDirectory() &&
        !keep.has(entry.name) &&
        /^\d+\.\d+\.\d+/.test(entry.name)
      ) {
        fs.rmSync(path.join(pkgDir, entry.name), {
          recursive: true,
          force: true,
        })
        removed.push(`${plugin.packageName}/${entry.name}`)
      }
    }
  }
  return removed
}

async function downloadPlugins(): Promise<void> {
  const built: BuiltPlugin[] = []
  const failures: { packageName: string; message: string }[] = []

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
      failures.push({ packageName: plugin.packageName, message })
    }
  }

  const merged = mergeWithPrevious(built)
  const manifest: BuildManifest = { plugins: merged }
  fs.writeFileSync(buildManifestPath, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`\nWrote ${buildManifestPath} (${merged.length} plugins)`)

  // Keep going through every plugin so one run surfaces all the breakage, then
  // grade the outcome by what publishing would actually lose — not by whether
  // anything failed.
  //
  // A failure whose plugin still has a previous manifest entry costs nothing:
  // the store keeps offering the last good version, whose bundle is still on
  // S3. Report it, but let the pipeline continue, so one flaky npm response
  // does not hold back the other sixteen plugins' updates.
  //
  // A failure with no entry to fall back on is different — that plugin would be
  // absent from v2_plugins.json, and since v2_plugins.json *is* the store
  // listing, publishing would unpublish it. `pnpm verify --changed` cannot catch
  // that either (no download means no dist/ change, so it is not in the changed
  // set), so this is the only place it can be stopped.
  const publishable = new Set(merged.map(p => p.packageName))
  const lost = failures.filter(f => !publishable.has(f.packageName))

  // Only on a run that is otherwise good. Deleting is safe regardless (S3 has
  // every version), but mixing a destructive step into an error path makes a
  // bad run harder to reason about, and the tree is worth leaving as-is while
  // someone diagnoses.
  if (lost.length === 0 && !values['no-prune']) {
    const removed = pruneUnpublished(merged)
    if (removed.length > 0) {
      console.log(
        `\nPruned ${removed.length} superseded version dir(s) — still on S3, ` +
          'refetch with `node fetch-version.ts <packageName> <version>`:\n' +
          removed.map(r => `  ${r}`).join('\n'),
      )
    }
  }

  if (failures.length > 0) {
    console.error(
      `\n${failures.length} plugin(s) failed to download:\n` +
        failures.map(f => `  ${f.packageName}: ${f.message}`).join('\n'),
    )
  }
  if (lost.length > 0 && !values['allow-failures']) {
    console.error(
      `\n${lost.length} of those have no previous build-manifest entry to fall back on:\n` +
        lost.map(f => `  ${f.packageName}`).join('\n') +
        '\nRefusing to continue: publishing now would drop them from the store.\n' +
        'Re-run to retry, or pass --allow-failures if the package is gone for good.',
    )
    process.exitCode = 1
  } else if (failures.length > 0) {
    console.error(
      lost.length > 0
        ? 'Dropping them anyway (--allow-failures).'
        : 'All of them keep their previous version, so the store loses nothing.',
    )
  }
}

downloadPlugins().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
