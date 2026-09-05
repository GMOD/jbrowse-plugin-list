import { addStructureFromData } from './addStructureFromData'
import { addStructureFromURL } from './addStructureFromURL'
import { extractPerResidueConfidence } from './extractPerResidueConfidence'
import { extractEntities } from './extractStructureSequences'

import type { EntityConfidence } from './extractPerResidueConfidence'
import type { Entity } from './extractStructureSequences'
import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export type { EntityConfidence } from './extractPerResidueConfidence'

export interface StructureData {
  entities?: Entity[]
  confidence?: EntityConfidence[]
  /** The molstar Structure this load created. Held by identity so highlights
   * bind to the right geometry — concurrent loads finish in arbitrary order, so
   * a position in `hierarchy.current.structures` identifies nothing stable. */
  molstarStructure?: Structure
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
  const { model, structure: molstarStructure } = structure.data
    ? await addStructureFromData({ data: structure.data, plugin })
    : structure.url
      ? await addStructureFromURL({ url: structure.url, plugin })
      : { model: undefined, structure: undefined }
  return {
    entities: model ? extractEntities(model) : undefined,
    confidence: model ? extractPerResidueConfidence(model) : undefined,
    molstarStructure,
  }
}
