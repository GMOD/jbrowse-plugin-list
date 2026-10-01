import { extractEntities, extractPerResidueConfidence } from 'p2s_mapper'

import loadMolstar from './loadMolstar'
import { loadStructure } from './structurePipeline'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { Entity, EntityConfidence } from 'p2s_mapper'

export type { EntityConfidence } from 'p2s_mapper'

export interface StructureData {
  entities?: Entity[]
  confidence?: EntityConfidence[]
  /** The Mol* structures this load created, one per model. Held by identity so
   * highlights bind to the right geometry — concurrent loads finish in
   * arbitrary order, so a position in `hierarchy.current.structures`
   * identifies nothing stable. */
  molstarStructures?: Structure[]
  /** Ids of every Mol* model this load created, which is how an interaction
   * on the shared plugin is told apart from one on another structure. */
  modelIds?: string[]
}

/**
 * Loads a structure (from inline data or a URL) into the given Molstar plugin
 * and pulls out its per-chain sequences and per-residue confidence. Pure with
 * respect to the model — it only touches the plugin and returns plain data, so
 * callers own the decision of whether/where to store the result.
 */
export async function loadStructureData({
  structure,
  plugin,
}: {
  structure: { data?: string; url?: string }
  plugin: PluginContext
}): Promise<StructureData> {
  const { data, url } = structure
  const {
    model,
    structures: molstarStructures,
    modelIds,
  } = data || url
    ? await loadStructure({ plugin, data: data || undefined, url })
    : { model: undefined, structures: [], modelIds: [] }
  // An experimental entry's B-factors are not confidence: read as pLDDT they
  // invert, drawing a well-ordered residue as "very low".
  const { MmcifFormat } = await loadMolstar()
  const source = model?.obj?.data.sourceData
  const methods =
    source && MmcifFormat.is(source)
      ? Array.from(source.data.db.exptl.method.toArray())
      : []
  const experimental = methods.some(m => m !== 'THEORETICAL MODEL')
  return {
    entities: model ? extractEntities(model) : undefined,
    confidence:
      model && !experimental ? extractPerResidueConfidence(model) : undefined,
    molstarStructures,
    modelIds,
  }
}
