import loadMolstar from './loadMolstar'

import type { Structure } from 'molstar/lib/mol-model/structure'

interface HoveredState {
  hoverPosition: {
    coord: number
    refName: string
  }
}

export function checkHovered(hovered: unknown): hovered is HoveredState {
  return (
    !!hovered &&
    typeof hovered === 'object' &&
    'hoverPosition' in hovered &&
    !!hovered.hoverPosition &&
    typeof hovered.hoverPosition === 'object' &&
    'coord' in hovered.hoverPosition &&
    'refName' in hovered.hoverPosition
  )
}

export async function getMolstarStructureSelection({
  structure,
  selectedResidue,
}: {
  structure: Structure
  selectedResidue: number
}) {
  const { Script } = await loadMolstar()
  return Script.getStructureSelection(
    Q =>
      Q.struct.generator.atomGroups({
        'residue-test': Q.core.rel.eq([
          Q.struct.atomProperty.macromolecular.label_seq_id(),
          selectedResidue,
        ]),
        'group-by': Q.struct.atomProperty.macromolecular.residueKey(),
      }),
    structure,
  )
}

export function invertMap(arg: Record<number, number>): Record<number, number> {
  return Object.fromEntries(Object.entries(arg).map(([a, b]) => [b, +a]))
}
