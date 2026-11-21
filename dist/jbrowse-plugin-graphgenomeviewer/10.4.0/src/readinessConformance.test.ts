import PluginManager from '@jbrowse/core/PluginManager'
import LinearGenomeViewPlugin from '@jbrowse/plugin-linear-genome-view'
import { expect, test } from 'vitest'

import GraphGenomeViewPlugin from './index'

import type DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'
import type ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'

// jb.waitReady, the app's ready marker, screenshot tools and the session
// thumbnail read an absent displayPhase or showLoading as finished, so a type
// without one reads ready while it loads. The same check for jbrowse-components'
// own types is products/jbrowse-web/src/schemaTests/ElementsReportLoading.test.ts
// there.

async function setup() {
  const pluginManager = new PluginManager([
    new LinearGenomeViewPlugin(),
    new GraphGenomeViewPlugin(),
  ])
  pluginManager.createPluggableElements()
  pluginManager.configure()
  const displays = pluginManager.getElementTypesInGroup(
    'display',
  ) as DisplayType[]
  const views = pluginManager.getElementTypesInGroup('view') as ViewType[]
  await Promise.all([...displays, ...views].map(t => t.loadStateModel()))
  return { pluginManager, displays, views }
}

function missing(instance: object, keys: string[]) {
  return keys.filter(k => !(k in instance))
}

test('every display type publishes displayPhase and svgReady', async () => {
  const { pluginManager, displays } = await setup()
  expect(displays.length).toBeGreaterThan(0)
  const gaps = displays.flatMap(t => {
    const display = t.stateModel.create(
      {
        type: t.name,
        configuration: t.configSchema.create({ displayId: 'x', type: t.name }),
      },
      { pluginManager },
    )
    const keys = missing(display, ['displayPhase', 'svgReady'])
    return keys.length ? [`${t.name}: ${keys.join(', ')}`] : []
  })
  expect(gaps).toEqual([])
})

test('every view type publishes showLoading, and an exporting one its init state', async () => {
  const { pluginManager, views } = await setup()
  expect(views.length).toBeGreaterThan(0)
  const gaps = views.flatMap(t => {
    const view = t.stateModel.create({ type: t.name }, { pluginManager })
    const keys = missing(
      view,
      'exportSvg' in view
        ? ['showLoading', 'initialized', 'error']
        : ['showLoading'],
    )
    return keys.length ? [`${t.name}: ${keys.join(', ')}`] : []
  })
  expect(gaps).toEqual([])
})
