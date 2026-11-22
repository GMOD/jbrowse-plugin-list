import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache'

import type PluginManager from '@jbrowse/core/PluginManager'

function hasMethod<T extends object>(
  adapter: object,
  method: keyof T & string,
): adapter is T {
  return typeof Reflect.get(adapter, method) === 'function'
}

// The adapter a request's config names, as T when it has `method`, else
// undefined. `name` is its config type, for saying which adapter lacks it:
// the bundle minifies class names.
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
  return {
    adapter: hasMethod<T>(dataAdapter, method) ? dataAdapter : undefined,
    name: String(adapterConfig.type),
  }
}
