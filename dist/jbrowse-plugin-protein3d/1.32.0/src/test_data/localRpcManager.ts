import PluginManager from '@jbrowse/core/PluginManager'

import AlignTranscriptRpcF from '../AlignTranscriptRpc'

/** The host's RPC dispatch without the worker: the registered method runs in
 * place, as it does under MainThreadRpcDriver. */
export function localRpcManager() {
  const pluginManager = new PluginManager()
  AlignTranscriptRpcF(pluginManager)
  pluginManager.createPluggableElements()
  return {
    call: (_sessionId: string, name: string, args: unknown) =>
      pluginManager.getRpcMethodType(name).execute(args),
  }
}
