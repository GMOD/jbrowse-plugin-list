import { extractEntities, extractPerResidueConfidence } from 'p2s_mapper'

import loadMolstar from './loadMolstar'
import { loadStructure } from './structurePipeline'

import type { Model, Structure } from 'molstar/lib/mol-model/structure'
import type { ModelFormat } from 'molstar/lib/mol-model-formats/format'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { Entity, EntityConfidence } from 'p2s_mapper'

export type { EntityConfidence } from 'p2s_mapper'

/** One of the entry's biological assemblies, as `pdbx_struct_assembly` lists
 * them. `wholeModel` marks one that is the deposited model unchanged: every
 * chain once, under the identity. */
export interface StructureAssembly {
  id: string
  oligomericDetails?: string
  wholeModel: boolean
}

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
  assemblies?: StructureAssembly[]
  /** The `assembly` this load was built with, so a change to it reloads. */
  assembly?: string
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

function oligomericDetails(
  model: Model,
  { MmcifFormat }: Molstar,
): Map<string, string> {
  const source = model.sourceData
  if (!MmcifFormat.is(source)) {
    return new Map()
  }
  const { id, oligomeric_details, _rowCount } =
    source.data.db.pdbx_struct_assembly
  const details = new Map<string, string>()
  for (let i = 0; i < _rowCount; i++) {
    const value = oligomeric_details.value(i)
    if (value) {
      details.set(id.value(i), value)
    }
  }
  return details
}

function structureAssemblies(model: Model, molstar: Molstar) {
  const details = oligomericDetails(model, molstar)
  const chains = new Set(
    Array.from(model.atomicHierarchy.chains.label_asym_id.toArray()),
  )
  return (molstar.ModelSymmetry.Provider.get(model)?.assemblies ?? []).map(
    ({ id, operatorGroups }): StructureAssembly => {
      const [group, ...rest] = operatorGroups
      const asymIds = new Set(group?.asymIds ?? chains)
      return {
        id,
        oligomericDetails: details.get(id),
        wholeModel:
          rest.length === 0 &&
          group?.operators.length === 1 &&
          group.operators[0]!.isIdentity &&
          [...chains].every(c => asymIds.has(c)),
      }
    },
  )
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
  structure: {
    data?: string
    url?: string
    assembly?: string
    chains?: readonly string[]
  }
  plugin: PluginContext
}): Promise<StructureData> {
  const { data, url, assembly, chains } = structure
  const {
    model,
    structures: molstarStructures,
    modelIds,
  } = await loadStructure({
    plugin,
    data: data || undefined,
    url,
    assembly,
    chains,
  })
  const molstar = await loadMolstar()
  // An experimental entry's B-factors are not confidence: read as pLDDT they
  // invert, drawing a well-ordered residue as "very low".
  const experimental = experimentalMethods(
    model?.obj?.data.sourceData,
    molstar,
  ).some(m => m !== 'THEORETICAL MODEL')
  return {
    entities: model ? extractEntities(model) : undefined,
    confidence:
      model && !experimental ? extractPerResidueConfidence(model) : undefined,
    molstarStructures,
    modelIds,
    assemblies: model?.obj ? structureAssemblies(model.obj.data, molstar) : [],
    assembly,
  }
}
