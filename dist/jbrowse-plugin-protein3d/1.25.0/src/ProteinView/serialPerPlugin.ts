import type { PluginContext } from 'molstar/lib/mol-plugin/context'

const tails = new WeakMap<PluginContext, Map<string, Promise<unknown>>>()

/**
 * Runs `task` after the earlier tasks of the same `lane` on `plugin` finish,
 * so two syncs that reactions start back to back never edit the state tree at
 * once. A failed task does not stop the next.
 */
export function serialPerPlugin<T>(
  plugin: PluginContext,
  lane: string,
  task: () => Promise<T>,
) {
  let lanes = tails.get(plugin)
  if (!lanes) {
    lanes = new Map()
    tails.set(plugin, lanes)
  }
  const previous = lanes.get(lane) ?? Promise.resolve()
  const run = previous.then(task)
  lanes.set(
    lane,
    run.catch(() => {}),
  )
  return run
}
