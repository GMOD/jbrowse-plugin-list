import { addStructureFromData } from './addStructureFromData'
import { addStructureFromURL } from './addStructureFromURL'
import { extractPerResidueConfidence } from './extractPerResidueConfidence'
import { extractEntities } from './extractStructureSequences'

import type { Entity } from './extractStructureSequences'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export interface StructureData {
  entities?: Entity[]
  confidence?: number[]
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
  const { model } = structure.data
    ? await addStructureFromData({ data: structure.data, plugin })
    : structure.url
      ? await addStructureFromURL({ url: structure.url, plugin })
      : { model: undefined }
  const entities = model ? extractEntities(model) : undefined
  const confidence = model
    ? extractPerResidueConfidence(model, entities?.[0]?.seq.length)
    : undefined
  return { entities, confidence }
}
