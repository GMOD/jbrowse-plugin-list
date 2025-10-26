#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pluginsFile = path.join(__dirname, 'plugins.json')
const outputFile = path.join(__dirname, 'new_plugins.json')

interface Plugin {
  [key: string]: string
}

interface PluginsData {
  plugins: Plugin[]
}

const pluginsData: PluginsData = JSON.parse(
  fs.readFileSync(pluginsFile, 'utf8'),
)

// Transform plugin URLs from unpkg to S3/jbrowse.org URLs
const newPlugins: PluginsData = {
  plugins: pluginsData.plugins.map(plugin => ({
    ...plugin,
    url: plugin.url.replace(
      /https:\/\/unpkg\.com\//,
      'https://jbrowse.org/plugins/',
    ),
  })),
}

fs.writeFileSync(outputFile, JSON.stringify(newPlugins, null, 2) + '\n')
console.log(`Generated ${outputFile}`)
