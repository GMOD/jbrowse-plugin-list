import { applyStructurePreset } from './structurePipeline'

import type { LoadStructureOptions } from './structurePipeline'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory'

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
  return applyStructurePreset({ plugin, trajectory, options })
}

export { type LoadStructureOptions } from './structurePipeline'
