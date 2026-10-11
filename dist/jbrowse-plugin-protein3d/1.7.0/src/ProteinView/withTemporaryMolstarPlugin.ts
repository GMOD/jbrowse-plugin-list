import loadMolstar from './loadMolstar'

import type { PluginContext } from 'molstar/lib/mol-plugin/context'

/**
 * Run a callback against a throwaway molstar plugin with no canvas and no
 * React UI: parsing a structure to read its sequences needs neither. The
 * previous version built a full `createPluginUI` and then called `unmount()`,
 * which leaves the WebGL context alive, so every structure previewed in the
 * launch dialog leaked one until the browser started reclaiming them.
 */
export async function withTemporaryMolstarPlugin<T>(
  callback: (plugin: PluginContext) => Promise<T>,
) {
  const { PluginContext, DefaultPluginSpec } = await loadMolstar()
  const plugin = new PluginContext(DefaultPluginSpec())
  await plugin.init()
  try {
    return await callback(plugin)
  } finally {
    plugin.dispose()
  }
}
