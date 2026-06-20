import { addStructureFromData } from './addStructureFromData'
import { addStructureFromURL } from './addStructureFromURL'
import { extractPerResidueConfidence } from './extractPerResidueConfidence'
import { extractStructureSequences } from './extractStructureSequences'

import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export interface StructureData {
  sequences?: string[]
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
  const sequences = model ? extractStructureSequences(model) : undefined
  const confidence = model
    ? extractPerResidueConfidence(model, sequences?.[0]?.length)
    : undefined
  return { sequences, confidence }
}
