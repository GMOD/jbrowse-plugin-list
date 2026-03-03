import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { StructureRepresentationPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset'
import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory'

export interface LoadStructureOptions {
  representationParams?: StructureRepresentationPresetProvider.CommonParams
}

export async function addStructureFromData({
  data,
  format = 'pdb',
  options,
  plugin,
}: {
  data: string
  format?: BuiltInTrajectoryFormat
  options?: LoadStructureOptions & { label?: string; dataLabel?: string }
  plugin: PluginContext
}) {
  const _data = await plugin.builders.data.rawData({
    data,
    label: options?.dataLabel,
  })

  const trajectory = await plugin.builders.structure.parseTrajectory(
    _data,
    format,
  )
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
