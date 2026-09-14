import loadMolstar from './loadMolstar'

import type { Mat4 } from 'molstar/lib/mol-math/linear-algebra'
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

  // each trace loci stays paired with the cell it came from, so a structure
  // that yields no loci cannot shift the transform onto its neighbour
  const traces = structures.flatMap(s => {
    const structure = s.cell.obj?.data
    if (!structure) {
      return []
    }
    const parent = plugin.helpers.substructureParent.get(structure)
    if (!parent) {
      return []
    }
    const rootStructure = plugin.state.data.selectQ(q =>
      q.byValue(parent).rootOfType(PluginStateObject.Molecule.Structure),
    )[0]?.obj?.data
    if (!rootStructure) {
      return []
    }
    const loci = StructureSelection.toLociWithSourceUnits(
      query(new QueryContext(structure)),
    )
    return [
      { cell: s.cell, loci: StructureElement.Loci.remap(loci, rootStructure) },
    ]
  })

  const pivot = traces[0]
  if (!pivot || traces.length < 2) {
    return
  }

  const coordinateSystem = plugin.managers.structure.hierarchy.findStructure(
    pivot.loci.structure,
  )?.transform?.cell.obj?.data.coordinateSystem

  for (const { cell, loci } of traces.slice(1)) {
    const result = tmAlign(pivot.loci, loci)
    const { bTransform, tmScoreA, tmScoreB, rmsd, alignedLength } = result
    await applyTransform(plugin, cell, bTransform, coordinateSystem)
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
