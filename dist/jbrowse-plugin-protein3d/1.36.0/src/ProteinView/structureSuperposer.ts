import { isAlive } from '@jbrowse/mobx-state-tree'

import { reportPluginFailure } from './reportPluginFailure'
import { superposeStructures } from './superposeStructures'

import type { SuperposedLoad } from './superposeStructures'
import type { SuperpositionOutcome } from './superpositionOutcome'
import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree'
import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export type SuperposedStructure = IAnyStateTreeNode & {
  readonly label: string
  readonly loadedToMolstar: boolean
  readonly molstarStructures: readonly Structure[]
  readonly error: unknown
  readonly alignmentPending: boolean
  readonly alignmentAwaitingSifts: boolean
  readonly alignment: unknown
  readonly mappedEntity:
    | {
        readonly entityId: string
        readonly seq: string
        readonly seqIds: readonly number[]
      }
    | undefined
  readonly coordinateMapper:
    | {
        readonly maps: {
          readonly structureSeqToTranscriptSeqPosition: Record<number, number>
        }
      }
    | undefined
  /** the author chains drawn, when only some are */
  readonly chains: readonly string[] | undefined
  setSuperposition: (outcome: SuperpositionOutcome | undefined) => void
}

export type SuperpositionKey = readonly unknown[]

export interface KeyedStructure {
  readonly loadedToMolstar: boolean
  readonly molstarStructures: readonly unknown[]
  readonly mappedEntity: { readonly entityId: string } | undefined
  readonly alignment: unknown
}

export interface SuperpositionState {
  /** The keys of the loads the last superposition covered; observable, so
   * the camera framing can wait for the reset that ends a superposition. */
  readonly superposedKeys: readonly SuperpositionKey[]
  /** Whether a run is under way in the current plugin; it ends in a camera
   * reset whatever is loaded by then. */
  readonly superposing: boolean
}

export type StructureSuperposerHost = IAnyStateTreeNode &
  SuperpositionState & {
    readonly molstarPluginContext: PluginContext | undefined
    readonly structures: readonly SuperposedStructure[]
    setSuperposedKeys: (keys: readonly SuperpositionKey[]) => void
    setSuperposing: (superposing: boolean) => void
    addNotice: (notice: unknown) => void
  }

function superposedLoad(s: SuperposedStructure): SuperposedLoad {
  const entity = s.mappedEntity
  const map = s.coordinateMapper?.maps.structureSeqToTranscriptSeqPosition
  return {
    label: s.label,
    structures: s.molstarStructures,
    mapping:
      entity && map
        ? {
            entityId: entity.entityId,
            residues: new Map(
              Object.entries(map).flatMap(([pos, transcript]) => {
                const i = Number(pos)
                const seqId = entity.seqIds[i]
                const code = entity.seq[i]
                return seqId === undefined || code === undefined
                  ? []
                  : [[seqId, { transcript, code }] as const]
              }),
            ),
            drawnChains: s.chains,
          }
        : undefined,
  }
}

// what a superposition of `s` depends on: its Mol* structures, and the chain
// and alignment that pick the copy it aligns by. The alignment is the one the
// coordinate mapper is built from, SIFTS-trimmed for a fusion, and a stable
// computed while this autorun reads it; the mapper itself is a new object on
// every read outside a reaction.
function loadKey(s: KeyedStructure): SuperpositionKey {
  return [s.molstarStructures, s.mappedEntity?.entityId, s.alignment]
}

function sameKeys(
  a: readonly SuperpositionKey[],
  b: readonly SuperpositionKey[],
) {
  return (
    a.length === b.length &&
    a.every((key, i) => key.every((part, j) => part === b[i]?.[j]))
  )
}

export function superpositionKeys(structures: readonly KeyedStructure[]) {
  return structures.filter(s => s.loadedToMolstar).map(loadKey)
}

/** No run is under way, and the structures loaded now are the ones the last
 * superposition covered, by identity, so a run for a chain pick, an imported
 * alignment or an assembly switch reads as not superposed, and so does one a
 * removal left a single structure behind. */
export function structuresSuperposed(
  host: SuperpositionState & { readonly structures: readonly KeyedStructure[] },
) {
  const keys = superpositionKeys(host.structures)
  return (
    !host.superposing &&
    (keys.length < 2 || sameKeys(keys, host.superposedKeys))
  )
}

/**
 * Builds the body of the autorun that keeps Molstar's structures superposed.
 *
 * Superposition is a pure function of which structures are loaded into the
 * current plugin and the chain each maps, so it is modeled as a reaction
 * rather than triggered imperatively when a structure is added. That keeps a
 * single loading path (the structure loader). The body reads its observable
 * dependencies synchronously (MobX only tracks reads before the first
 * `await`) and dispatches one guarded, fire-and-forget run:
 *
 *   - it waits for every loaded structure's alignment, and for the SIFTS
 *     answer of a PDB entry that has one, which say which chain to align by
 *     and which residues pair, so a structure is moved once rather than by
 *     its whole contents and again by its chain, and a fusion partner's
 *     chance pairs never steer it. A failed structure and a PDB entry with no
 *     transcript wait for nothing;
 *   - a non-observable in-flight flag serializes runs so overlapping molstar
 *     state mutations can't interleave. The host's `superposing` mirrors it
 *     for the current plugin, so settling waits for the camera reset a run
 *     ends in, and a plugin swap clears it, so a run stuck in a torn-down
 *     plugin holds nothing back;
 *   - the host's `superposedKeys`, the keys of the loads it covered, and
 *     `superposedPlugin` remember the last alignment, so a run only happens
 *     when the loaded set, a mapped chain or the plugin changes, not on every
 *     reaction. The loads are compared by identity, since a removal and a
 *     load during a run can leave as many loaded as it covered;
 *   - after a run finishes it re-checks, because the loaded set may have grown
 *     (or the plugin been swapped) while it was aligning;
 *   - every observable is read before the in-flight check, so a reset that
 *     lands mid-run (Re-align, a removal) is still tracked, and the run leaves
 *     a reset alone rather than overwriting it.
 */
export function makeStructureSuperposer(host: StructureSuperposerHost) {
  let superposing = false
  let superposedPlugin: PluginContext | undefined

  function run() {
    const { molstarPluginContext: plugin, structures } = host
    const loaded = structures.filter(s => s.loadedToMolstar)
    const keys = loaded.map(loadKey)
    const mapped = loaded.every(
      s =>
        s.error !== undefined ||
        (!s.alignmentPending && !s.alignmentAwaitingSifts),
    )
    const loads = mapped ? loaded.map(superposedLoad) : []
    const loadedCount = loaded.length
    if (plugin !== superposedPlugin) {
      superposedPlugin = plugin
      host.setSuperposedKeys([])
      host.setSuperposing(false)
    }
    const startKeys = host.superposedKeys
    const changed = !sameKeys(keys, startKeys)
    if (loadedCount < 2) {
      for (const s of loaded) {
        s.setSuperposition(undefined)
      }
    }
    if (plugin && !superposing && mapped && loadedCount >= 2 && changed) {
      superposing = true
      host.setSuperposing(true)
      superposeStructures(plugin, loads)
        .then(outcomes => {
          if (host.molstarPluginContext === plugin) {
            loaded.forEach((s, i) => {
              if (isAlive(s)) {
                s.setSuperposition(outcomes[i])
              }
            })
          }
        })
        .catch(reportPluginFailure(host, plugin))
        .finally(() => {
          superposing = false
          if (isAlive(host)) {
            // a run into a plugin swapped away mid-flight covered nothing
            if (host.molstarPluginContext === plugin) {
              if (host.superposedKeys === startKeys) {
                host.setSuperposedKeys(keys)
              }
              host.setSuperposing(false)
            }
            run()
          }
        })
    }
  }
  return run
}
