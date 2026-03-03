#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import { createGunzip } from 'zlib';
import * as tar from 'tar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginsFile = path.join(__dirname, 'plugins.json');
const outputDir = path.join(__dirname, 'dist');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pluginsData = JSON.parse(fs.readFileSync(pluginsFile, 'utf8'));

interface Plugin {
  url: string;
  name: string;
  packageName: string;
  umdFile: string;
}

interface NpmPackageMetadata {
  'dist-tags': {
    latest: string;
  };
  versions: {
    [version: string]: {
      dist: {
        tarball: string;
      };
    };
  };
}

async function fetchPackageMetadata(
  packageName: string,
): Promise<NpmPackageMetadata> {
  const registryUrl = `https://registry.npmjs.org/${packageName}`;
  const response = await fetch(registryUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch package metadata: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

async function downloadAndExtractTarball(
  tarballUrl: string,
  destDir: string,
): Promise<void> {
  const response = await fetch(tarballUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download tarball: ${response.status} ${response.statusText}`,
    );
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const pendingWrites: Promise<void>[] = [];

  return new Promise((resolve, reject) => {
    Readable.fromWeb(response.body as any)
      .pipe(createGunzip())
      .pipe(
        tar.t({
          onentry: (entry) => {
            // Tarball entries are prefixed with "package/"
            if (!entry.path.startsWith('package/')) {
              return;
            }
            const relativePath = entry.path.slice('package/'.length);
            if (!relativePath || entry.type === 'Directory') {
              return;
            }
            const destPath = path.join(destDir, relativePath);
            const dir = path.dirname(destPath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            const writeStream = fs.createWriteStream(destPath);
            const writePromise = new Promise<void>((resolveWrite, rejectWrite) => {
              writeStream.on('finish', resolveWrite);
              writeStream.on('error', rejectWrite);
            });
            pendingWrites.push(writePromise);
            entry.pipe(writeStream);
          },
        }),
      )
      .on('finish', async () => {
        try {
          await Promise.all(pendingWrites);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function downloadPlugins(): Promise<void> {
  const plugins: Plugin[] = pluginsData.plugins;

  for (const plugin of plugins) {
    const pluginName = plugin.name;
    const packageName = plugin.packageName;

    try {
      console.log(`Fetching ${pluginName} from npm registry...`);

      const metadata = await fetchPackageMetadata(packageName);
      const latestVersion = metadata['dist-tags'].latest;
      const tarballUrl = metadata.versions[latestVersion].dist.tarball;

      console.log(`  Latest version: ${latestVersion}`);

      const pluginDestDir = path.join(outputDir, packageName);
      const packageJsonDestPath = path.join(pluginDestDir, 'package.json');

      // Check if package.json already exists and has the same version
      if (fs.existsSync(packageJsonDestPath)) {
        const existingPackageJson = JSON.parse(fs.readFileSync(packageJsonDestPath, 'utf8'));
        if (existingPackageJson.version === latestVersion) {
          console.log(`  Already up to date (v${latestVersion})`);
          console.log(`✓ Skipped ${pluginName}`);
          continue;
        }
        console.log(`  Updating from v${existingPackageJson.version} to v${latestVersion}`);
      }

      console.log(`  Downloading tarball...`);

      await downloadAndExtractTarball(tarballUrl, pluginDestDir);

      console.log(`✓ Downloaded ${pluginName}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`✗ Failed to download ${pluginName}: ${message}`);
    }
  }

  console.log('\nDownload complete!');
}

downloadPlugins().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
