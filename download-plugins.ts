#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

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

async function downloadFile(url: string, filePath: string): Promise<void> {
  const response = await fetch(url, {
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  if (!response.body) {
    throw new Error(`No response body for ${url}`);
  }

  const file = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    Readable.fromWeb(response.body as any)
      .pipe(file)
      .on('finish', () => {
        resolve();
      })
      .on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
  });
}

async function downloadPlugins(): Promise<void> {
  const plugins: Plugin[] = pluginsData.plugins;

  for (const plugin of plugins) {
    const url = plugin.url;
    const pluginName = plugin.name;

    // Extract the filename from the URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const packageDir = url.match(/unpkg\.com\/([^\/]+)/)?.[1];

    if (!packageDir) {
      console.error(`✗ Could not extract package name from ${url}`);
      continue;
    }

    const pluginDir = path.join(outputDir, packageDir);

    // Create plugin directory
    if (!fs.existsSync(pluginDir)) {
      fs.mkdirSync(pluginDir, { recursive: true });
    }

    const filePath = path.join(pluginDir, filename);

    try {
      console.log(`Downloading ${pluginName}...`);
      await downloadFile(url, filePath);
      console.log(`✓ Downloaded ${pluginName}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`✗ Failed to download ${pluginName}: ${message}`);
    }
  }

  console.log('Download complete!');
}

downloadPlugins().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
