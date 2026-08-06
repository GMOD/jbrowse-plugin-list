#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { parseArgs } from 'node:util'

import { satisfies } from 'compare-versions'

import type {
  BuildManifest,
  BuiltPlugin,
  SourceManifest,
  V2Plugin,
} from './manifest-types.ts'

const { values } = parseArgs({
  options: { 'allow-missing': { type: 'boolean', default: false } },
})

const dir = import.meta.dirname

const buildManifestPath = process.env.PLUGIN_BUILD_MANIFEST
  ? path.resolve(process.env.PLUGIN_BUILD_MANIFEST)
  : path.join(dir, 'build-manifest.json')

const { plugins } = JSON.parse(
  fs.readFileSync(path.join(dir, 'plugins.json'), 'utf8'),
) as SourceManifest

const build = JSON.parse(
  fs.readFileSync(buildManifestPath, 'utf8'),
) as BuildManifest

const builtByName = new Map<string, BuiltPlugin>(
  build.plugins.map(p => [p.packageName, p]),
)

// `*`/`''` mean "any JBrowse version"; compare-versions throws on those so the
// consumer special-cases them and never calls satisfies(). Every other range
// must parse, otherwise the consumer's satisfies() throws, is swallowed as "no
// match", and the plugin silently becomes uninstallable for everyone. Reject
// unparsable ranges here so a bad `jbrowseRange` fails the build loudly instead.
function assertValidRange(packageName: string, range: string) {
  if (range !== '*' && range !== '') {
    try {
      satisfies('0.0.0', range)
    } catch {
      throw new Error(
        `${packageName}: invalid jbrowseRange "${range}" (not a semver range)`,
      )
    }
  }
}

function latestVersion(built: BuiltPlugin) {
  const found = built.versions.find(v => v.pluginVersion === built.latest)
  if (!found) {
    throw new Error(
      `${built.packageName}: latest ${built.latest} missing from versions`,
    )
  }
  return found
}

// A plugin missing from the build manifest failed to download (network, npm
// 404, renamed package) — or the download step never ran. Dropping it silently
// is not a safe default: v2_plugins.json is the published store listing, so a
// dropped entry means the plugin disappears from the store for everyone, and
// the drop is invisible in the `pnpm dep` chain (a plugin with no download has
// no dist/ change, so `pnpm verify --changed` does not select it either).
//
// download-plugins-npm-api.ts already refuses to continue on failure; this is
// the same guard for anyone running `pnpm generate` on its own or against a
// stale build-manifest.json. --allow-missing is the deliberate escape hatch for
// retiring a package that is gone from npm for good.
const missing = plugins
  .filter(p => !builtByName.has(p.packageName))
  .map(p => p.packageName)
if (missing.length > 0) {
  const detail = missing.map(m => `  ${m}`).join('\n')
  if (values['allow-missing']) {
    console.warn(
      `⚠ dropping ${missing.length} plugin(s) with no build-manifest entry (--allow-missing):\n${detail}`,
    )
  } else {
    throw new Error(
      `${missing.length} plugin(s) in plugins.json have no build-manifest entry:\n${detail}\n` +
        'Run `pnpm download` first. Publishing now would remove them from the store.\n' +
        'Pass --allow-missing to drop them on purpose.',
    )
  }
}

const v2: V2Plugin[] = plugins.flatMap(plugin => {
  const built = builtByName.get(plugin.packageName)
  if (!built) {
    return []
  }
  for (const version of built.versions) {
    assertValidRange(plugin.packageName, version.jbrowseRange)
  }
  const latest = latestVersion(built)
  const { name, authors, description, location, tags, license, image } = plugin
  return [
    {
      name,
      packageName: plugin.packageName,
      authors,
      description,
      location,
      ...(tags === undefined ? {} : { tags }),
      license,
      ...(image === undefined ? {} : { image }),
      url: latest.url,
      integrity: latest.integrity,
      versions: built.versions,
    },
  ]
})

// Backstop for the one path that can still empty the manifest: --allow-missing
// with nothing left to publish. An empty store listing is never the intent.
if (v2.length === 0) {
  throw new Error('no plugins generated — refusing to publish an empty store')
}

// Overridable for the same reason PLUGIN_DIST_DIR and PLUGIN_BUILD_MANIFEST
// are: so the pipeline can be exercised end to end without writing over the
// committed manifest that `pnpm upload` publishes.
const v2Path = process.env.PLUGIN_V2_OUT
  ? path.resolve(process.env.PLUGIN_V2_OUT)
  : path.join(dir, 'v2_plugins.json')
fs.writeFileSync(v2Path, JSON.stringify({ plugins: v2 }, null, 2) + '\n')
console.log(`Generated ${v2Path}`)
