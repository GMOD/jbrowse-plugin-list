#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pluginsFile = path.join(__dirname, 'plugins.json');
const outputFile = path.join(__dirname, 'new_plugins.json');

const pluginsData = JSON.parse(fs.readFileSync(pluginsFile, 'utf8'));

// Transform plugin URLs from npm: to S3 URLs
const newPlugins = {
  plugins: pluginsData.plugins.map((plugin) => ({
    ...plugin,
    url: `https://jbrowse.org/plugins/${plugin.url.replace('npm:', '')}/index.umd.js`,
  })),
};

fs.writeFileSync(outputFile, JSON.stringify(newPlugins, null, 2) + '\n');
console.log(`Generated ${outputFile}`);
