import { applyStructurePreset } from './structurePipeline'

import type { LoadStructureOptions } from './structurePipeline'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory'

export type { LoadStructureOptions }

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
  return applyStructurePreset({ plugin, trajectory, options })
}
