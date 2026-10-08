import {
  isBinaryStructureUrl,
  structureFormatFromContent,
  structureFormatFromName,
} from 'p2s_mapper'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory'
import type { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects'
import type { StateObjectSelector } from 'molstar/lib/mol-state'

type RawStructure = StateObjectSelector<
  PluginStateObject.Data.String | PluginStateObject.Data.Binary
>

// Typed as always resolving to a trajectory, but Mol* reverts a parse that
// fails and resolves with nothing
function parseTrajectory(
  plugin: PluginContext,
  raw: RawStructure,
  format: BuiltInTrajectoryFormat,
): Promise<
  StateObjectSelector<PluginStateObject.Molecule.Trajectory> | undefined
> {
  return plugin.builders.structure.parseTrajectory(raw, format)
}

/** Download or ingest a structure and parse it into a trajectory, with the
 * format sniffed from the content or the url unless the caller says otherwise.
 * Needs no renderer, so a headless plugin can run it to read sequences.
 *
 * A parse that fails resolves with no trajectory, and a file read with the
 * wrong parser can yield one with no frames. Both used to reach the user as
 * `Cannot read properties of undefined` from a later call, so they are named
 * here, parser included. */
export async function parseStructureTrajectory({
  plugin,
  data,
  url,
  format,
  dataLabel,
}: {
  plugin: PluginContext
  data?: string
  url?: string
  format?: BuiltInTrajectoryFormat
  dataLabel?: string
}) {
  let raw: RawStructure
  let parsedAs: BuiltInTrajectoryFormat
  if (data !== undefined) {
    parsedAs = format ?? structureFormatFromContent(data)
    raw = await plugin.builders.data.rawData(
      { data, label: dataLabel },
      { state: { isGhost: true } },
    )
  } else if (url !== undefined) {
    parsedAs = format ?? structureFormatFromName(url)
    raw = await plugin.builders.data.download(
      { url, isBinary: isBinaryStructureUrl(url) },
      { state: { isGhost: true } },
    )
  } else {
    throw new Error('a structure needs either data or a url')
  }
  const trajectory = await parseTrajectory(plugin, raw, parsedAs)
  if (!trajectory?.obj?.data.frameCount) {
    throw new Error(
      `No model could be read from ${url ?? dataLabel ?? 'the structure data'} as ${parsedAs}`,
    )
  }
  return trajectory
}

type ModelSelector = StateObjectSelector<PluginStateObject.Molecule.Model>

interface StructureSelector {
  readonly obj?: { data: Structure }
}

// The 'all-models' preset hands back { model, structure } through the default
// preset for a single-model trajectory, { models, structures } for an
// ensemble, and {} if the trajectory vanished.
function presetOutput(
  preset:
    | { model: ModelSelector; structure: StructureSelector }
    | { models?: ModelSelector[]; structures?: StructureSelector[] }
    | undefined,
) {
  return preset && 'structure' in preset
    ? { models: [preset.model], structures: [preset.structure] }
    : { models: preset?.models ?? [], structures: preset?.structures ?? [] }
}

/**
 * Build the trajectory's models, structures and representations. One load is
 * one Mol* structure per model, so an NMR ensemble is twenty of them, and the
 * load returns every one: a colour, a highlight or a superposition that
 * addresses only the first leaves the other nineteen behind. They come from
 * the preset rather than `hierarchy.current.structures`, which also holds every
 * other load's.
 */
async function applyStructurePreset(
  plugin: PluginContext,
  trajectory: StateObjectSelector,
) {
  const preset = await plugin.builders.structure.hierarchy.applyPreset(
    trajectory,
    'all-models',
    { useDefaultIfSingleModel: true },
  )
  const { models, structures } = presetOutput(preset)
  const loaded = structures.flatMap(s => (s.obj ? [s.obj.data] : []))
  return {
    model: models[0],
    structures: loaded,
    modelIds: loaded.flatMap(s => s.models.map(m => m.id)),
  }
}

/** Load a structure from its text or its url, as the view shows one. */
export async function loadStructure({
  plugin,
  data,
  url,
}: {
  plugin: PluginContext
  data?: string
  url?: string
}) {
  const trajectory = await parseStructureTrajectory({ plugin, data, url })
  return applyStructurePreset(plugin, trajectory)
}
