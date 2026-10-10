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

/**
 * A track's adapter config as its requests carry it. A worker has no assembly
 * manager, so a gbz-base track's lanes learn the session's PanSN aliases here.
 */
export function trackAdapterConfig(
  node: IAnyStateTreeNode,
  track: AnyConfigurationModel,
) {
  const adapterConfig = readConfObject(track, 'adapter') as Record<
    string,
    unknown
  >
  return adapterConfig.type === 'GbzBaseSyntenyAdapter'
    ? withPanSNAliases(
        adapterConfig,
        getSession(node).assemblyManager.assemblyList.map(conf => ({
          name: readConfObject(conf, 'name') as string,
          aliases: (readConfObject(conf, 'aliases') ?? []) as string[],
        })),
      )
    : adapterConfig
}
