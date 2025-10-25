#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const pluginsFile = path.join(__dirname, 'plugins.json');
const outputDir = path.join(__dirname, 'dist');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pluginsData = JSON.parse(fs.readFileSync(pluginsFile, 'utf8'));

async function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.destroy();
        downloadFile(response.headers.location, filePath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        file.destroy();
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function downloadPlugins() {
  const plugins = pluginsData.plugins;

  for (const plugin of plugins) {
    const npmUrl = plugin.url;

    // Convert npm:package-name to package-name
    const packageName = npmUrl.replace('npm:', '');

    // Try to download the UMD bundle from unpkg
    const unpkgUrl = `https://unpkg.com/${packageName}/dist/index.umd.js`;
    const pluginDir = path.join(outputDir, packageName);

    // Create plugin directory
    if (!fs.existsSync(pluginDir)) {
      fs.mkdirSync(pluginDir, { recursive: true });
    }

    const filePath = path.join(pluginDir, 'index.umd.js');

    try {
      console.log(`Downloading ${packageName}...`);
      await downloadFile(unpkgUrl, filePath);
      console.log(`✓ Downloaded ${packageName}`);
    } catch (error) {
      console.error(`✗ Failed to download ${packageName}: ${error.message}`);
    }
  }

  console.log('Download complete!');
}

downloadPlugins().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
