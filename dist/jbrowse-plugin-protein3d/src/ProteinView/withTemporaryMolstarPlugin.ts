import loadMolstar from './loadMolstar'

import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export async function withTemporaryMolstarPlugin<T>(
  callback: (plugin: PluginContext) => Promise<T>,
) {
  const { createPluginUI, renderReact18 } = await loadMolstar()
  const ret = document.createElement('div')
  const plugin = await createPluginUI({
    target: ret,
    render: renderReact18,
  })

  try {
    return await callback(plugin)
  } finally {
    plugin.unmount()
    ret.remove()
  }
}
