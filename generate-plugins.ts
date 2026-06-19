#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

import { legacyRehostedUrl } from './manifest-types.ts'
import type {
  BuildManifest,
  BuiltPlugin,
  SourceManifest,
  V1Plugin,
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

function latestVersion(built: BuiltPlugin) {
  const found = built.versions.find(v => v.pluginVersion === built.latest)
  if (!found) {
    throw new Error(
      `${built.packageName}: latest ${built.latest} missing from versions`,
    )
  }
  return found
}

const v1: V1Plugin[] = []
const v2: V2Plugin[] = []

for (const plugin of plugins) {
  const built = builtByName.get(plugin.packageName)
  if (!built) {
    throw new Error(
      `${plugin.packageName}: no build-manifest entry (run download first)`,
    )
  }
  const latest = latestVersion(built)
  const { name, authors, description, location, plug_n_play, license, image } =
    plugin

  v1.push({
    name,
    authors,
    description,
    location,
    ...(plug_n_play === undefined ? {} : { plug_n_play }),
    url: legacyRehostedUrl(plugin.packageName, plugin.umdPath),
    license,
    ...(image === undefined ? {} : { image }),
  })

  v2.push({
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
  })
}

const v1Path = path.join(dir, 'new_plugins.json')
const v2Path = path.join(dir, 'v2_plugins.json')
fs.writeFileSync(v1Path, JSON.stringify({ plugins: v1 }, null, 2) + '\n')
fs.writeFileSync(v2Path, JSON.stringify({ plugins: v2 }, null, 2) + '\n')
console.log(`Generated ${v1Path} and ${v2Path}`)
