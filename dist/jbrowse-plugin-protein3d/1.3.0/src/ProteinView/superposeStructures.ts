import loadMolstar from './loadMolstar'
import { structureRootCell } from './structureCells'

import type { Mat4 } from 'molstar/lib/mol-math/linear-algebra'
import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { StateObjectRef } from 'molstar/lib/mol-state'

const SuperpositionTag = 'SuperpositionTransform'

/**
 * TM-align every load onto the first, one load per structure of the view. A
 * load's first model decides its transform and all its models take the same
 * one, so an NMR ensemble moves as a unit and keeps its spread. The loads come
 * from the view rather than `hierarchy.current.structures`, which lists an
 * ensemble's models as separate structures: it used to align each of them on
 * its own, twenty TM-aligns for one NMR entry.
 */
export async function superposeStructures(
  plugin: PluginContext,
  loads: readonly (readonly Structure[])[],
) {
  const molstar = await loadMolstar()
  const {
    QueryContext,
    StateTransforms,
    StructureElement,
    StructureSelection,
    StructureSelectionQueries,
    PluginCommands,
    tmAlign,
  } = molstar
  const { query } = StructureSelectionQueries.trace

  // each trace loci stays paired with the cells it moves, so a load that
  // yields no loci cannot shift the transform onto its neighbour
  const traces = loads.flatMap(load => {
    const [first] = load
    const cells = load.flatMap(s => structureRootCell(plugin, molstar, s) ?? [])
    const [rootCell] = cells
    const root = rootCell?.obj?.data
    if (!first || !rootCell || !root) {
      return []
    }
    const loci = StructureSelection.toLociWithSourceUnits(
      query(new QueryContext(first)),
    )
    return [{ rootCell, cells, loci: StructureElement.Loci.remap(loci, root) }]
  })

  const [pivot, ...mobile] = traces
  if (!pivot || mobile.length === 0) {
    return
  }

  // the pivot keeps a transform an earlier superposition gave it, as when the
  // structure it was aligned to has been removed, and the rest follow it there
  const pivotTransform = plugin.state.data.selectQ(q =>
    q
      .byValue(pivot.rootCell)
      .subtree()
      .withTransformer(StateTransforms.Model.TransformStructureConformation),
  )[0]
  const coordinateSystem = pivotTransform?.obj?.data.coordinateSystem

  for (const { cells, loci } of mobile) {
    const { bTransform, tmScoreA, tmScoreB, rmsd, alignedLength } = tmAlign(
      pivot.loci,
      loci,
    )
    for (const cell of cells) {
      await applyTransform(plugin, cell, bTransform, coordinateSystem)
    }
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
