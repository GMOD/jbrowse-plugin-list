import { readConfObject } from '@jbrowse/core/configuration'
import { getSession } from '@jbrowse/core/util'

import type { AnyConfigurationModel } from '@jbrowse/core/configuration'
import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree'

export interface AssemblyAliases {
  name: string
  aliases: string[]
}

// Only `sample#haplotype`, the spelling gbz-base gives a walk's prefix. A bare
// alias is indistinguishable from an ordinary one (hg38's `GRCh38`) and would
// replace the identity mapping that already resolves an assembly named as its
// sample; at sample depth it would also claim both of a diploid's walks, since
// `panSNMatchesPrefix` matches `HG002` against `HG002#1` and `HG002#2`. Three
// parts name a contig, not a haplotype.
const PANSN_HAPLOTYPE = /^[^#]+#\d+$/

// The config's `assemblyNameToPanSN` with each assembly's PanSN alias added
// beneath it: an entry wins for its assembly and for its prefix. Unchanged when
// no alias qualifies, so such a track keeps its adapter cache key.
export function withPanSNAliases(
  adapterConfig: Record<string, unknown>,
  assemblies: AssemblyAliases[],
) {
  const explicit = (adapterConfig.assemblyNameToPanSN ?? {}) as Record<
    string,
    string
  >
  const claimed = new Set(Object.values(explicit))
  const fromAliases: Record<string, string> = {}
  for (const { name, aliases } of assemblies) {
    const prefix = aliases.find(alias => PANSN_HAPLOTYPE.test(alias))
    if (prefix !== undefined && !claimed.has(prefix)) {
      fromAliases[name] = prefix
    }
  }
  return Object.keys(fromAliases).length === 0
    ? adapterConfig
    : {
        ...adapterConfig,
        assemblyNameToPanSN: { ...fromAliases, ...explicit },
      }
}

// The config's `assemblyNames` and `assemblyNameToPanSN` keys by each
// assembly's canonical name, the name a window arrives with. An alias renamed
// here still resolves to itself as a PanSN prefix. Unchanged when every name is
// canonical.
export function withCanonicalAssemblyNames(
  adapterConfig: Record<string, unknown>,
  assemblies: AssemblyAliases[],
) {
  const canonical = (name: string) =>
    assemblies.find(a => a.name === name || a.aliases.includes(name))?.name ??
    name
  const names = (adapterConfig.assemblyNames ?? []) as string[]
  const explicit = (adapterConfig.assemblyNameToPanSN ?? {}) as Record<
    string,
    string
  >
  if ([...names, ...Object.keys(explicit)].every(n => canonical(n) === n)) {
    return adapterConfig
  }
  const map = new Map<string, string>()
  for (const [name, prefix] of Object.entries(explicit)) {
    const to = canonical(name)
    if (to === name || !map.has(to)) {
      map.set(to, prefix)
    }
  }
  for (const name of names) {
    const to = canonical(name)
    if (to !== name && !map.has(to)) {
      map.set(to, name)
    }
  }
  return {
    ...adapterConfig,
    assemblyNames: names.map(canonical),
    assemblyNameToPanSN: Object.fromEntries(map),
  }
}

// The adapters that declare `headerLanes`, whose lanes are PanSN haplotypes
export const LANE_ADAPTERS = new Set([
  'GbzBaseSyntenyAdapter',
  'WalkTabixSyntenyAdapter',
])

/**
 * A track's adapter config as its requests carry it. A worker has no assembly
 * manager, so a lane track learns the session's assembly names and PanSN
 * aliases here.
 */
export function trackAdapterConfig(
  node: IAnyStateTreeNode,
  track: AnyConfigurationModel,
) {
  const adapterConfig = readConfObject(track, 'adapter') as Record<
    string,
    unknown
  >
  if (!LANE_ADAPTERS.has(adapterConfig.type as string)) {
    return adapterConfig
  }
  const assemblies = getSession(node).assemblyManager.assemblyList.map(
    conf => ({
      name: readConfObject(conf, 'name') as string,
      aliases: (readConfObject(conf, 'aliases') ?? []) as string[],
    }),
  )
  return withPanSNAliases(
    withCanonicalAssemblyNames(adapterConfig, assemblies),
    assemblies,
  )
}
