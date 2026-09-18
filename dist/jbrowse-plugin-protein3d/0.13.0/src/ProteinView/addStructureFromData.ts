import {
  applyStructurePreset,
  parseStructureTrajectory,
} from './structurePipeline'

import type { LoadStructureOptions } from './structurePipeline'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory'

/** Format defaults to what the content itself says. It used to default to
 * 'pdb', so an mmCIF opened via the file dialog previewed correctly (that path
 * detected the format) and then loaded into the view as a zero-entity model. */
export async function addStructureFromData({
  data,
  format,
  options,
  plugin,
}: {
  data: string
  format?: BuiltInTrajectoryFormat
  options?: LoadStructureOptions & { label?: string; dataLabel?: string }
  plugin: PluginContext
}) {
  const trajectory = await parseStructureTrajectory({
    plugin,
    data,
    format,
    dataLabel: options?.dataLabel,
  })
  return applyStructurePreset({ plugin, trajectory, options })
}

export { type LoadStructureOptions } from './structurePipeline'
