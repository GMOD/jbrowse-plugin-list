import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { StructureRepresentationPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset'
import type { StateObjectSelector } from 'molstar/lib/mol-state'

export interface LoadStructureOptions {
  representationParams?: StructureRepresentationPresetProvider.CommonParams
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
