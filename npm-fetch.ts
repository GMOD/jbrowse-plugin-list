// Shared npm tarball fetching, used by the nightly download pipeline
// (download-plugins-npm-api.ts) and by the on-demand single-version fetch
// (fetch-version.ts). Kept in its own module because importing from the
// pipeline script would run the whole pipeline as a side effect.

import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'

import * as tar from 'tar'

export interface NpmPackageMetadata {
  'dist-tags': { latest: string }
  versions: Record<string, { dist: { tarball: string } }>
}

export async function fetchPackageMetadata(
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

export async function downloadAndExtractTarball(
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

// Extract a tarball into versionDir atomically: files land in a `.partial`
// sibling and the dir is renamed into place only once the umd bundle is
// confirmed present. So a versionDir is either absent or a complete package —
// the umd and any lazily-loaded sidecar chunks (e.g. protein3d's
// `molstar-chunk.js`) can never be split across a half-written extraction that
// an append-only skip would then reuse.
export async function downloadVersionAtomic(
  tarballUrl: string,
  versionDir: string,
  umdPath: string | undefined,
  label: string,
): Promise<void> {
  const partialDir = `${versionDir}.partial`
  fs.rmSync(partialDir, { recursive: true, force: true })
  await downloadAndExtractTarball(tarballUrl, partialDir)
  if (umdPath !== undefined && !fs.existsSync(path.join(partialDir, umdPath))) {
    fs.rmSync(partialDir, { recursive: true, force: true })
    throw new Error(`${label}: umdPath "${umdPath}" not found in package`)
  }
  fs.rmSync(versionDir, { recursive: true, force: true })
  fs.renameSync(partialDir, versionDir)
}
