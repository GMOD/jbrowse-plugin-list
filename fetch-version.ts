#!/usr/bin/env node
//
// fetch-version.ts
//
// Materialises one already-published plugin version into `dist/` on demand.
//
// `dist/` keeps only what an upload needs — each plugin's `latest/` and the one
// version `v2_plugins.json` currently publishes. Every older version stays
// permanently on S3 (the upload is `rclone copy`, which never deletes), so git
// was storing a second copy of artifacts that were already immutable and public.
// This script is how you get one back when you need it, which is almost always
// to reproduce a past break:
//
//   node fetch-version.ts jbrowse-plugin-msaview 2.7.0
//   node check-plugins.ts --only jbrowse-plugin-msaview \
//     --bundle jbrowse-plugin-msaview=dist/jbrowse-plugin-msaview/2.7.0 \
//     --versions v4.0.0,v4.3.0,latest
//
// The bytes come from npm, the same source the original upload came from, and
// are then checked against what S3 is actually serving — so a fetched version is
// verified to be the published artifact, not merely a plausible rebuild. That
// check is the part git was really providing, and it is stronger here: git could
// only tell you what was committed, this tells you what users load.
//
// Usage:
//   node fetch-version.ts <packageName> <version> [--out <dir>] [--no-verify]
//
import fs from 'fs'
import path from 'path'
import { parseArgs } from 'node:util'

import { downloadVersionAtomic, fetchPackageMetadata } from './npm-fetch.ts'
import {
  rehostedUrl,
  subresourceIntegrity,
  type SourceManifest,
} from './manifest-types.ts'

const { values, positionals } = parseArgs({
  options: {
    out: { type: 'string' },
    'no-verify': { type: 'boolean', default: false },
  },
  allowPositionals: true,
})

const [packageName, version] = positionals
if (packageName === undefined || version === undefined) {
  console.error(
    'usage: node fetch-version.ts <packageName> <version> [--out <dir>] [--no-verify]',
  )
  process.exit(2)
}

const dir = import.meta.dirname
const outputDir = process.env.PLUGIN_DIST_DIR
  ? path.resolve(process.env.PLUGIN_DIST_DIR)
  : path.join(dir, 'dist')

// umdPath is only needed to sanity-check the extraction and to locate the file
// to verify against S3. A package that has since been dropped from plugins.json
// (icgc, mafviewer) still fetches — it just skips those two checks.
const { plugins } = JSON.parse(
  fs.readFileSync(path.join(dir, 'plugins.json'), 'utf8'),
) as SourceManifest
const umdPath = plugins.find(p => p.packageName === packageName)?.umdPath

const versionDir = path.join(outputDir, packageName, version)
const label = `${packageName}@${version}`

const metadata = await fetchPackageMetadata(packageName)
const release = metadata.versions[version]
if (!release) {
  // npm is the only source that can enumerate a package's files; S3 serves them
  // but cannot be listed over plain https. So an unpublished version has to be
  // pulled back by hand, which is still possible because the urls are immutable.
  console.error(
    `${label} is not on npm (unpublished?).\n` +
      'The artifacts are still on S3 and can be fetched individually, e.g.\n' +
      `  curl -O ${rehostedUrl(packageName, version, umdPath ?? 'dist/<bundle>.umd.production.min.js')}\n` +
      'or listed with `rclone --config rclone.conf lsf -R ' +
      `s3:jbrowse.org/plugins/${packageName}/${version}/` +
      '` if you have credentials.',
  )
  process.exit(1)
}

console.log(`Fetching ${label} from npm...`)
await downloadVersionAtomic(release.dist.tarball, versionDir, umdPath, label)
console.log(`✓ Extracted to ${versionDir}`)

if (values['no-verify'] || umdPath === undefined) {
  console.log(
    umdPath === undefined
      ? 'Skipped S3 verification: package is not in plugins.json, so no umdPath is known.'
      : 'Skipped S3 verification (--no-verify).',
  )
} else {
  const url = rehostedUrl(packageName, version, umdPath)
  const response = await fetch(url)
  if (!response.ok) {
    console.error(
      `⚠ ${url} returned ${response.status} — this version may never have been published.`,
    )
    process.exitCode = 1
  } else {
    const served = Buffer.from(await response.arrayBuffer())
    const local = fs.readFileSync(path.join(versionDir, umdPath))
    if (served.equals(local)) {
      console.log(`✓ Byte-identical to what S3 serves (${url})`)
    } else {
      // Not necessarily fatal — a plugin can republish the same version number
      // to npm — but it means this build is not the one users are loading, so a
      // repro against it is testing different bytes.
      console.error(
        `⚠ Does NOT match what S3 serves.\n` +
          `  fetched  ${subresourceIntegrity(path.join(versionDir, umdPath))}\n` +
          `  served   sha384-${(await import('crypto')).createHash('sha384').update(served).digest('base64')}\n` +
          `  ${url}`,
      )
      process.exitCode = 1
    }
  }
}
