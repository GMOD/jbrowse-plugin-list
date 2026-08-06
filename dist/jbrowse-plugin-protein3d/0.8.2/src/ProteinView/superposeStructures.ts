import loadMolstar from './loadMolstar'

import type { Mat4 } from 'molstar/lib/mol-math/linear-algebra'
import type { StructureElement } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { StateObjectRef } from 'molstar/lib/mol-state'

const SuperpositionTag = 'SuperpositionTransform'

export async function superposeStructures(plugin: PluginContext) {
  const {
    QueryContext,
    StructureElement,
    StructureSelection,
    StructureSelectionQueries,
    PluginCommands,
    PluginStateObject,
    tmAlign,
  } = await loadMolstar()

  const structures = plugin.managers.structure.hierarchy.current.structures
  if (structures.length < 2) {
    return
  }

  const { query } = StructureSelectionQueries.trace

  const locis = structures.map(s => {
    const structure = s.cell.obj?.data
    if (!structure) {
      return undefined
    }
    const parent = plugin.helpers.substructureParent.get(structure)
    if (!parent) {
      return undefined
    }
    const rootStructure = plugin.state.data.selectQ(q =>
      q.byValue(parent).rootOfType(PluginStateObject.Molecule.Structure),
    )[0]?.obj?.data
    if (!rootStructure) {
      return undefined
    }
    const loci = StructureSelection.toLociWithSourceUnits(
      query(new QueryContext(structure)),
    )
    return StructureElement.Loci.remap(loci, rootStructure)
  })

  const validLocis = locis.filter(
    (l): l is StructureElement.Loci => l !== undefined,
  )
  if (validLocis.length < 2) {
    return
  }

  const pivot = plugin.managers.structure.hierarchy.findStructure(
    validLocis[0]?.structure,
  )
  const coordinateSystem = pivot?.transform?.cell.obj?.data.coordinateSystem

  for (let i = 1; i < validLocis.length; i++) {
    const result = tmAlign(validLocis[0]!, validLocis[i]!)
    const { bTransform, tmScoreA, tmScoreB, rmsd, alignedLength } = result
    await applyTransform(
      plugin,
      structures[i]!.cell,
      bTransform,
      coordinateSystem,
    )
    plugin.log.info(
      `TM-align: TM-score=${tmScoreA.toFixed(4)}/${tmScoreB.toFixed(4)}, RMSD=${rmsd.toFixed(2)} Å, aligned ${alignedLength} residues.`,
    )
  }

  await new Promise(res => requestAnimationFrame(res))
  await PluginCommands.Camera.Reset(plugin)
}

async function applyTransform(
  plugin: PluginContext,
  s: StateObjectRef,
  matrix: Mat4,
  coordinateSystem: { matrix: Mat4 } | undefined,
) {
  const { Mat4, StateObjectRef, StateTransforms } = await loadMolstar()
  const r = StateObjectRef.resolveAndCheck(plugin.state.data, s)
  if (!r) {
    return
  }

  const o = plugin.state.data.selectQ(q =>
    q
      .byRef(r.transform.ref)
      .subtree()
      .withTransformer(StateTransforms.Model.TransformStructureConformation),
  )[0]

  const finalTransform =
    coordinateSystem && !Mat4.isIdentity(coordinateSystem.matrix)
      ? Mat4.mul(Mat4(), coordinateSystem.matrix, matrix)
      : matrix

  const params = {
    transform: {
      name: 'matrix' as const,
      params: { data: finalTransform, transpose: false },
    },
  }

  const b = o
    ? plugin.state.data.build().to(o).update(params)
    : plugin.state.data
        .build()
        .to(s)
        .insert(StateTransforms.Model.TransformStructureConformation, params, {
          tags: SuperpositionTag,
        })

  await plugin.runTask(plugin.state.data.updateTree(b))
}
