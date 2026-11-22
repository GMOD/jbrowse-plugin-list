import { readConfObject } from '@jbrowse/core/configuration'
import { getSession } from '@jbrowse/core/util'
import { getConfAssemblyNamesOrNone } from '@jbrowse/core/util/tracks'

import { trackAdapterSnapshot, walkIndexed } from '../graphTrackConfig'

import type { AnyTrackConfig } from '@jbrowse/core/configuration'
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

// `HG00621.1`, as HPRC and the hosted configs name a haplotype's assembly, and
// as a MAF names its rows
const DOTTED_HAPLOTYPE = /^([^#]+)\.(\d+)$/

function aliasHaplotype({ aliases }: AssemblyAliases) {
  return aliases.find(a => PANSN_HAPLOTYPE.test(a))
}

function dottedHaplotype({ name }: AssemblyAliases) {
  const dotted = DOTTED_HAPLOTYPE.exec(name)
  return dotted ? `${dotted[1]}#${dotted[2]}` : undefined
}

// The config's `assemblyNameToPanSN` with each assembly's PanSN haplotype
// added beneath it, so a lane on that haplotype draws on the assembly and its
// genes. An entry wins for its assembly and for its prefix, then a
// `sample#haplotype` alias, then the assembly's own name read as
// `sample.haplotype`. The anchor's name is never read so, since an accession
// such as GCA_000001405.15 has that shape and the anchor is the walk file's
// reference, not one of its lanes. Unchanged when no assembly qualifies, so
// such a track keeps its adapter cache key.
export function withPanSNAliases(
  adapterConfig: Record<string, unknown>,
  assemblies: AssemblyAliases[],
  anchor?: string,
) {
  const explicit = (adapterConfig.assemblyNameToPanSN ?? {}) as Record<
    string,
    string
  >
  const claimed = new Set(Object.values(explicit))
  const fromAliases: Record<string, string> = {}
  const lanes = assemblies.filter(a => a.name !== anchor)
  for (const [read, from] of [
    [aliasHaplotype, assemblies],
    [dottedHaplotype, lanes],
  ] as const) {
    for (const assembly of from) {
      const prefix = read(assembly)
      if (
        prefix !== undefined &&
        !claimed.has(prefix) &&
        !(assembly.name in explicit) &&
        !(assembly.name in fromAliases)
      ) {
        fromAliases[assembly.name] = prefix
        claimed.add(prefix)
      }
    }
  }
  return Object.keys(fromAliases).length === 0
    ? adapterConfig
    : {
        ...adapterConfig,
        assemblyNameToPanSN: { ...fromAliases, ...explicit },
      }
}

function canonicalName(assemblies: AssemblyAliases[], name: string) {
  return (
    assemblies.find(a => a.name === name || a.aliases.includes(name))?.name ??
    name
  )
}

// The config's `assemblyNames` and `assemblyNameToPanSN` keys by each
// assembly's canonical name, the name a window arrives with. An alias renamed
// here still resolves to itself as a PanSN prefix. Unchanged when every name is
// canonical.
export function withCanonicalAssemblyNames(
  adapterConfig: Record<string, unknown>,
  assemblies: AssemblyAliases[],
) {
  const canonical = (name: string) => canonicalName(assemblies, name)
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
 * manager, so a lane track, or a walk-indexed rGFA track cutting for named
 * haplotypes, learns the session's assembly names and PanSN aliases here.
 */
export function trackAdapterConfig(
  node: IAnyStateTreeNode,
  track: AnyTrackConfig,
) {
  const adapterConfig = trackAdapterSnapshot(track)
  if (
    !LANE_ADAPTERS.has(adapterConfig.type as string) &&
    !walkIndexed(adapterConfig)
  ) {
    return adapterConfig
  }
  const assemblies = getSession(node).assemblyManager.assemblyList.map(
    conf => ({
      name: readConfObject(conf, 'name'),
      aliases: readConfObject(conf, 'aliases'),
    }),
  )
  const [anchor] = getConfAssemblyNamesOrNone(track)
  return withPanSNAliases(
    withCanonicalAssemblyNames(adapterConfig, assemblies),
    assemblies,
    anchor === undefined ? undefined : canonicalName(assemblies, anchor),
  )
}
