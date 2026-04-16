import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { StructureRepresentationPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset'
import type { StateObjectSelector } from 'molstar/lib/mol-state'

export interface LoadStructureOptions {
  representationParams?: StructureRepresentationPresetProvider.CommonParams
}

export async function applyStructurePreset({
  plugin,
  trajectory,
  options,
}: {
  plugin: PluginContext
  trajectory: StateObjectSelector
  options?: LoadStructureOptions
}) {
  const model = await plugin.builders.structure.createModel(trajectory)

  await plugin.builders.structure.hierarchy.applyPreset(
    trajectory,
    'all-models',
    {
      useDefaultIfSingleModel: true,
      representationPresetParams: options?.representationParams,
    },
  )
  return { model }
}
