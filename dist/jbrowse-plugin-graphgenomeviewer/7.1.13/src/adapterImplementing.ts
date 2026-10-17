import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache'

import type PluginManager from '@jbrowse/core/PluginManager'

// The adapter a request's config names, as T when it has `method`, else
// undefined. `name` is its class name, for saying which adapter lacks it.
export async function adapterImplementing<T extends object>(
  pluginManager: PluginManager,
  {
    sessionId,
    adapterConfig,
  }: { sessionId: string; adapterConfig: Record<string, unknown> },
  method: keyof T & string,
) {
  const { dataAdapter } = await getAdapter(
    pluginManager,
    sessionId,
    adapterConfig,
  )
  const implemented =
    typeof (dataAdapter as unknown as Record<string, unknown>)[method] ===
    'function'
  return {
    adapter: implemented ? (dataAdapter as unknown as T) : undefined,
    name: dataAdapter.constructor.name,
  }
}
