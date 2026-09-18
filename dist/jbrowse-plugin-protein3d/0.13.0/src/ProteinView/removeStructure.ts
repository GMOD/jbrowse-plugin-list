import type { Structure } from 'molstar/lib/mol-model/structure'

interface RemovableRef {
  kind: string
  model?: { trajectory?: RemovableRef }
}

interface RemovableHierarchy {
  findStructure(structure: Structure | undefined): RemovableRef | undefined
  remove(refs: (RemovableRef | string)[]): Promise<void> | undefined
}

export interface StructureRemovalHost {
  managers: { structure: { hierarchy: RemovableHierarchy } }
}

/**
 * Take one structure out of Mol*, by the trajectory it came from: removing the
 * structure node alone would leave the download, trajectory and model nodes
 * behind, and an NMR ensemble's other models with them. The handle is resolved
 * through `findStructure`, which reads Mol*'s substructure-parent map, so it
 * still finds a structure a superposition has transformed.
 */
export async function removeMolstarStructure({
  plugin,
  molstarStructure,
}: {
  plugin: StructureRemovalHost
  molstarStructure: Structure | undefined
}) {
  const { hierarchy } = plugin.managers.structure
  const ref = hierarchy.findStructure(molstarStructure)
  const target = ref?.model?.trajectory ?? ref
  if (target) {
    await hierarchy.remove([target])
  }
}
