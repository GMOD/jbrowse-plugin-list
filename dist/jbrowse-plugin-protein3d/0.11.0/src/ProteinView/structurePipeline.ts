import {
  isBinaryStructureUrl,
  structureFormatFromContent,
  structureFormatFromName,
} from './structureFormat'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { StructureRepresentationPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset'
import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory'
import type { StateObjectSelector } from 'molstar/lib/mol-state'

export interface LoadStructureOptions {
  representationParams?: StructureRepresentationPresetProvider.CommonParams
}

/** Download or ingest a structure and parse it into a trajectory, with the
 * format sniffed from the content or the url unless the caller says otherwise.
 * Needs no renderer, so a headless plugin can run it to read sequences. */
export async function parseStructureTrajectory({
  plugin,
  data,
  url,
  format,
  dataLabel,
}: {
  plugin: PluginContext
  data?: string
  url?: string
  format?: BuiltInTrajectoryFormat
  dataLabel?: string
}) {
  if (data !== undefined) {
    const raw = await plugin.builders.data.rawData({ data, label: dataLabel })
    return plugin.builders.structure.parseTrajectory(
      raw,
      format ?? structureFormatFromContent(data),
    )
  }
  if (url === undefined) {
    throw new Error('a structure needs either data or a url')
  }
  const downloaded = await plugin.builders.data.download(
    { url, isBinary: isBinaryStructureUrl(url) },
    { state: { isGhost: true } },
  )
  return plugin.builders.structure.parseTrajectory(
    downloaded,
    format ?? structureFormatFromName(url),
  )
}

// The 'all-models' preset returns { structure } for a single-model trajectory
// and { structures } for a multi-model one (and {} if the trajectory vanished).
// Callers only care about the structure this load produced, so collapse the
// three shapes here — this is the only handle that identifies *our* structure,
// since hierarchy.current.structures is ordered by load completion.
interface StructureSelector {
  readonly obj?: { data: Structure }
}

function presetStructure(
  preset:
    | { structure: StructureSelector }
    | { structures?: StructureSelector[] }
    | undefined,
): Structure | undefined {
  const selector =
    preset && 'structure' in preset ? preset.structure : preset?.structures?.[0]
  return selector?.obj?.data
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

  const preset = await plugin.builders.structure.hierarchy.applyPreset(
    trajectory,
    'all-models',
    {
      useDefaultIfSingleModel: true,
      representationPresetParams: options?.representationParams,
    },
  )
  return { model, structure: presetStructure(preset) }
}
