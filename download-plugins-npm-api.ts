#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { createGunzip } from 'zlib'
import * as tar from 'tar'

const outputDir = path.join(import.meta.dirname, 'dist')
fs.mkdirSync(outputDir, { recursive: true })

interface Plugin {
  name: string
  packageName: string
}

interface PluginsData {
  plugins: Plugin[]
}

interface NpmPackageMetadata {
  'dist-tags': { latest: string }
  versions: Record<string, { dist: { tarball: string } }>
}

const { plugins } = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, 'plugins.json'), 'utf8'),
) as PluginsData

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
            if (!entry.path.startsWith('package/')) {
              return
            }
            const relativePath = entry.path.slice('package/'.length)
            if (!relativePath || entry.type === 'Directory') {
              return
            }
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
          },
        }),
      )
      .on('finish', async () => {
        try {
          await Promise.all(pendingWrites)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
      .on('error', reject)
  })
}

async function downloadPlugins(): Promise<void> {
  for (const { name, packageName } of plugins) {
    try {
      console.log(`Fetching ${name}...`)
      const metadata = await fetchPackageMetadata(packageName)
      const latestVersion = metadata['dist-tags'].latest
      const tarballUrl = metadata.versions[latestVersion].dist.tarball
      const pluginDestDir = path.join(outputDir, packageName)
      const packageJsonPath = path.join(pluginDestDir, 'package.json')

      if (fs.existsSync(packageJsonPath)) {
        const { version: existingVersion } = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8'),
        ) as { version: string }
        if (existingVersion === latestVersion) {
          console.log(`✓ ${name} already at v${latestVersion}`)
          continue
        }
        console.log(`  Updating ${name}: v${existingVersion} → v${latestVersion}`)
      }

      await downloadAndExtractTarball(tarballUrl, pluginDestDir)
      console.log(`✓ Downloaded ${name} v${latestVersion}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`✗ Failed ${name}: ${message}`)
    }
  }

  console.log('\nDownload complete!')
}

downloadPlugins().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
