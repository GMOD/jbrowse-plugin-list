import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export default function clearSelection({ plugin }: { plugin: PluginContext }) {
  plugin.managers.interactivity.lociSelects.deselectAll()
}
