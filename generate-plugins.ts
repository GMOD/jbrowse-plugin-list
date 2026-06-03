#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

interface Plugin {
  name: string
  packageName: string
  authors: string[]
  description: string
  location: string
  plug_n_play?: number
  url: string
  license: string
  image?: string
}

interface PluginsData {
  plugins: Plugin[]
}

const pluginsData = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, 'plugins.json'), 'utf8'),
) as PluginsData

const newPlugins = {
  plugins: pluginsData.plugins.map(({ packageName: _packageName, ...rest }) => ({
    ...rest,
    url: rest.url.replace('https://unpkg.com/', 'https://jbrowse.org/plugins/'),
  })),
}

const outputFile = path.join(import.meta.dirname, 'new_plugins.json')
fs.writeFileSync(outputFile, JSON.stringify(newPlugins, null, 2) + '\n')
console.log(`Generated ${outputFile}`)
