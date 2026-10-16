import { extractEntities, extractPerResidueConfidence } from 'p2s_mapper'

import loadMolstar from './loadMolstar'
import { loadStructure } from './structurePipeline'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { ModelFormat } from 'molstar/lib/mol-model-formats/format'
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

type Molstar = Awaited<ReturnType<typeof loadMolstar>>

function pdbExperimentalMethods(source: ModelFormat, { PdbFormat }: Molstar) {
  if (!PdbFormat.is(source)) {
    return []
  }
  const { data, indices, count } = source.data.lines
  const methods: string[] = []
  for (let i = 0; i < count; i++) {
    const line = data.substring(indices[2 * i]!, indices[2 * i + 1])
    if (line.startsWith('EXPDTA')) {
      methods.push(...line.slice(10).split(';'))
    } else if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
      break
    }
  }
  return methods.map(m => m.trim()).filter(m => m !== '')
}

// Mol* converts a PDB file to mmCIF without filling `exptl`, so its method is
// read from the EXPDTA records of the file it kept.
function experimentalMethods(
  source: ModelFormat | undefined,
  molstar: Molstar,
) {
  if (!source || !molstar.MmcifFormat.is(source)) {
    return []
  }
  const { db, source: original } = source.data
  return [
    ...Array.from<string>(db.exptl.method.toArray()),
    ...(original ? pdbExperimentalMethods(original, molstar) : []),
  ]
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
  } = await loadStructure({ plugin, data: data || undefined, url })
  // An experimental entry's B-factors are not confidence: read as pLDDT they
  // invert, drawing a well-ordered residue as "very low".
  const experimental = experimentalMethods(
    model?.obj?.data.sourceData,
    await loadMolstar(),
  ).some(m => m !== 'THEORETICAL MODEL')
  return {
    entities: model ? extractEntities(model) : undefined,
    confidence:
      model && !experimental ? extractPerResidueConfidence(model) : undefined,
    molstarStructures,
    modelIds,
  }
}
