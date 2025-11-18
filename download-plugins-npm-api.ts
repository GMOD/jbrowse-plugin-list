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
  packageName: string,
  filePathInPackage: string,
  destPath: string,
  packageJsonDestPath: string,
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

  // Create destination directories
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const packageJsonDir = path.dirname(packageJsonDestPath);
  if (!fs.existsSync(packageJsonDir)) {
    fs.mkdirSync(packageJsonDir, { recursive: true });
  }

  // The file paths in the tarball are prefixed with "package/"
  const tarballFilePath = `package/${filePathInPackage}`;
  const tarballPackageJsonPath = 'package/package.json';

  const filesToExtract = new Map([
    [tarballFilePath, destPath],
    [tarballPackageJsonPath, packageJsonDestPath],
  ]);

  const foundFiles = new Set<string>();
  const pendingWrites: Promise<void>[] = [];

  return new Promise((resolve, reject) => {
    Readable.fromWeb(response.body as any)
      .pipe(createGunzip())
      .pipe(
        tar.t({
          onentry: (entry) => {
            const destFilePath = filesToExtract.get(entry.path);
            if (destFilePath) {
              foundFiles.add(entry.path);
              const writeStream = fs.createWriteStream(destFilePath);

              const writePromise = new Promise<void>((resolveWrite, rejectWrite) => {
                writeStream.on('finish', resolveWrite);
                writeStream.on('error', rejectWrite);
              });

              pendingWrites.push(writePromise);
              entry.pipe(writeStream);
            }
          },
        }),
      )
      .on('finish', async () => {
        try {
          await Promise.all(pendingWrites);

          if (!foundFiles.has(tarballFilePath)) {
            reject(
              new Error(
                `File ${filePathInPackage} not found in package tarball`,
              ),
            );
          } else if (!foundFiles.has(tarballPackageJsonPath)) {
            reject(new Error('package.json not found in package tarball'));
          } else {
            resolve();
          }
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
    const umdFile = plugin.umdFile;

    try {
      console.log(`Fetching ${pluginName} from npm registry...`);

      // Fetch package metadata from npm registry
      const metadata = await fetchPackageMetadata(packageName);
      const latestVersion = metadata['dist-tags'].latest;
      const tarballUrl = metadata.versions[latestVersion].dist.tarball;

      console.log(`  Latest version: ${latestVersion}`);
      console.log(`  Downloading tarball...`);

      // Destination paths in dist
      const destPath = path.join(outputDir, packageName, umdFile);
      const packageJsonDestPath = path.join(outputDir, packageName, 'package.json');

      // Download and extract the specific file and package.json from tarball
      await downloadAndExtractTarball(
        tarballUrl,
        packageName,
        umdFile,
        destPath,
        packageJsonDestPath,
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
