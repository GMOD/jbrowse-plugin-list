#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

import { satisfies } from 'compare-versions'

import type {
  BuildManifest,
  BuiltPlugin,
  SourceManifest,
  V2Plugin,
} from './manifest-types.ts'

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

const v2: V2Plugin[] = plugins.map(plugin => {
  const built = builtByName.get(plugin.packageName)
  if (!built) {
    throw new Error(
      `${plugin.packageName}: no build-manifest entry (run download first)`,
    )
  }
  for (const version of built.versions) {
    assertValidRange(plugin.packageName, version.jbrowseRange)
  }
  const latest = latestVersion(built)
  const { name, authors, description, location, plug_n_play, license, image } =
    plugin
  return {
    name,
    packageName: plugin.packageName,
    authors,
    description,
    location,
    ...(plug_n_play === undefined ? {} : { plug_n_play }),
    license,
    ...(image === undefined ? {} : { image }),
    url: latest.url,
    integrity: latest.integrity,
    versions: built.versions,
  }
})

const v2Path = path.join(dir, 'v2_plugins.json')
fs.writeFileSync(v2Path, JSON.stringify({ plugins: v2 }, null, 2) + '\n')
console.log(`Generated ${v2Path}`)
