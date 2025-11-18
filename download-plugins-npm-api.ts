#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
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
  packageName: string,
  filePathInPackage: string,
  destPath: string,
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

  // Create destination directory
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // The file path in the tarball is prefixed with "package/"
  const tarballFilePath = `package/${filePathInPackage}`;

  let fileFound = false;

  return new Promise((resolve, reject) => {
    Readable.fromWeb(response.body as any)
      .pipe(createGunzip())
      .pipe(
        tar.t({
          onentry: (entry) => {
            if (entry.path === tarballFilePath) {
              fileFound = true;
              const writeStream = fs.createWriteStream(destPath);
              entry.pipe(writeStream);
              writeStream.on('finish', () => {
                resolve();
              });
              writeStream.on('error', reject);
            }
          },
        }),
      )
      .on('finish', () => {
        if (!fileFound) {
          reject(
            new Error(
              `File ${filePathInPackage} not found in package tarball`,
            ),
          );
        }
      })
      .on('error', reject);
  });
}

async function downloadPlugins(): Promise<void> {
  const plugins: Plugin[] = pluginsData.plugins;

  for (const plugin of plugins) {
    const url = plugin.url;
    const pluginName = plugin.name;

    // Extract the package name and the rest of the path after it
    const match = url.match(/unpkg\.com\/([^\/]+)\/(.*)/);

    if (!match || !match[1]) {
      console.error(`✗ Could not extract package name from ${url}`);
      continue;
    }

    const packageName = match[1];
    const restOfPath = match[2];

    try {
      console.log(`Fetching ${pluginName} from npm registry...`);

      // Fetch package metadata from npm registry
      const metadata = await fetchPackageMetadata(packageName);
      const latestVersion = metadata['dist-tags'].latest;
      const tarballUrl = metadata.versions[latestVersion].dist.tarball;

      console.log(`  Latest version: ${latestVersion}`);
      console.log(`  Downloading tarball...`);

      // Destination path in dist
      const destPath = path.join(outputDir, packageName, restOfPath);

      // Download and extract the specific file from tarball
      await downloadAndExtractTarball(
        tarballUrl,
        packageName,
        restOfPath,
        destPath,
      );

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
