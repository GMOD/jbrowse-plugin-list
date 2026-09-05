import {
  applyStructurePreset,
  parseStructureTrajectory,
} from './structurePipeline'

import type { LoadStructureOptions } from './structurePipeline'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory'

/** Format defaults to what the URL's extension says, so a `.pdb`/`.ent`
 * archive URL loads rather than throwing in the mmCIF parser. */
export async function addStructureFromURL({
  url,
  format,
  options,
  plugin,
}: {
  url: string
  format?: BuiltInTrajectoryFormat
  options?: LoadStructureOptions & { label?: string }
  plugin: PluginContext
}) {
  const trajectory = await parseStructureTrajectory({ plugin, url, format })
  return applyStructurePreset({ plugin, trajectory, options })
}

export { type LoadStructureOptions } from './structurePipeline'
