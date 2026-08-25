import { addStructureFromData } from './addStructureFromData'
import { addStructureFromURL } from './addStructureFromURL'
import { extractPerResidueConfidence } from './extractPerResidueConfidence'
import { extractEntities } from './extractStructureSequences'

import type { Entity } from './extractStructureSequences'
import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

/**
 * Per-residue B-factor / pLDDT, tagged with the entity it was read from.
 * `extractPerResidueConfidence` walks residues in model order, so the values
 * only describe the *first* entity — consumers must check `entityId` against
 * the entity they are plotting against rather than assume the two line up.
 */
export interface EntityConfidence {
  entityId: string
  values: number[]
}

export interface StructureData {
  entities?: Entity[]
  confidence?: EntityConfidence
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
  const entities = model ? extractEntities(model) : undefined
  const first = entities?.[0]
  const values = model
    ? extractPerResidueConfidence(model, first?.seq.length)
    : undefined
  return {
    entities,
    confidence:
      first && values ? { entityId: first.entityId, values } : undefined,
    molstarStructure,
  }
}
