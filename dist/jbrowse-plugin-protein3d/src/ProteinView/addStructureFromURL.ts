import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { StructureRepresentationPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset'
import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory'

export interface LoadStructureOptions {
  representationParams?: StructureRepresentationPresetProvider.CommonParams
}

export async function addStructureFromURL({
  url,
  format = 'mmcif',
  isBinary,
  options,
  plugin,
}: {
  url: string
  format?: BuiltInTrajectoryFormat
  isBinary?: boolean
  options?: LoadStructureOptions & { label?: string }
  plugin: PluginContext
}) {
  const data = await plugin.builders.data.download(
    {
      url,
      isBinary,
    },
    {
      state: {
        isGhost: true,
      },
    },
  )

  const trajectory = await plugin.builders.structure.parseTrajectory(
    data,
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
