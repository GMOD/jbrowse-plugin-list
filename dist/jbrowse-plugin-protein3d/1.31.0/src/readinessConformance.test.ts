import PluginManager from '@jbrowse/core/PluginManager'
import { expect, test } from 'vitest'

import ProteinViewer from './index'

import type ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'

// jb.waitReady, the app's ready marker and screenshot tools read an absent
// showLoading as finished, so a view without one reads ready while it loads.
// The same check for jbrowse-components' own views is
// products/jbrowse-web/src/schemaTests/ElementsReportLoading.test.ts there.
test('every view type this plugin registers publishes showLoading', async () => {
  const pluginManager = new PluginManager([new ProteinViewer()])
  pluginManager.createPluggableElements()
  const views = pluginManager.getElementTypesInGroup('view') as ViewType[]
  expect(views.length).toBeGreaterThan(0)
  await Promise.all(views.map(t => t.loadStateModel()))
  const gaps = views.flatMap(t => {
    const view = t.stateModel.create({ type: t.name }, { pluginManager })
    const keys = (
      'exportSvg' in view
        ? ['showLoading', 'initialized', 'error']
        : ['showLoading']
    ).filter(k => !(k in view))
    return keys.length ? [`${t.name}: ${keys.join(', ')}`] : []
  })
  expect(gaps).toEqual([])
})
