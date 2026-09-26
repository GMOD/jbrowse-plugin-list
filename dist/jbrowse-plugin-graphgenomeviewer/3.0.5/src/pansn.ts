import type { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter'

// PanSN naming convention: `sample#haplotype#contig`. Shared by the all-vs-all
// PAF adapters (in-memory and tabix-indexed), which anchor on the sample prefix
// and strip it to recover each assembly's own refName.
const SEP = '#'

// The PanSN sample name is the token before the first separator, e.g.
// `grape#1#chr1` -> `grape`.
export function panSNSample(refName: string) {
  return refName.split(SEP)[0]!
}

// The haplotype a three-part PanSN name belongs to, `sample#hap`, which is the
// assembly that contributed it where one sample is two haplotypes (HPRC release
// 2.1 names every node `NA20809#2#CM094351.1`); undefined for a name that
// states no haplotype.
export function panSNHaplotype(refName: string) {
  const parts = refName.split(SEP)
  return parts.length >= 3 ? `${parts[0]}${SEP}${parts[1]}` : undefined
}

// Strip the PanSN prefix to recover the assembly's own refName: `sample#hap#chr1`
// -> `chr1`, `sample#chr1` -> `chr1`. A contig that itself contains the
// separator is assumed not to occur (PanSN uses `#` only as the delimiter).
export function panSNContig(refName: string) {
  const parts = refName.split(SEP)
  return parts.length >= 3
    ? parts.slice(2).join(SEP)
    : parts.length === 2
      ? parts[1]!
      : refName
}

// Whether a PanSN name belongs to a prefix at either depth: `grape#1#chr1`
// matches `grape` and `grape#1`, not `grape#2` or `grapefruit`. An undefined
// prefix is "no assembly supplied", which nothing belongs to.
export function panSNMatchesPrefix(
  refName: string,
  prefix: string | undefined,
) {
  return (
    prefix !== undefined &&
    (refName === prefix || refName.startsWith(prefix + SEP))
  )
}

// How a config maps the session's assembly names onto the PanSN spelling a
// graph uses, and back. Every adapter here declares an `assemblyNameToPanSN`
// slot for it — the graph says `GRCh38#0` where the assembly is `hg38` — so
// resolving a name is the same question in all of them, and it used to be
// answered by two copies of these functions in two directories.
//
// `?? {}` so an adapter whose schema lacks the slot identity-maps rather than
// throwing a TypeError deep inside a query.
function assemblyNameToPanSN(adapter: BaseFeatureDataAdapter) {
  return (adapter.getConf('assemblyNameToPanSN') ?? {}) as Record<
    string,
    string
  >
}

// One assembly name as its PanSN sample prefix, identity when the config maps
// it to nothing. Overloaded rather than widened: undefined passes through, so a
// caller can express "no anchor/target supplied", and a caller that has a name
// gets a `string` back instead of having to re-assert one.
export function resolvePanSNPrefix(
  adapter: BaseFeatureDataAdapter,
  name: string,
): string
export function resolvePanSNPrefix(
  adapter: BaseFeatureDataAdapter,
  name: string | undefined,
): string | undefined
export function resolvePanSNPrefix(
  adapter: BaseFeatureDataAdapter,
  name: string | undefined,
) {
  return name === undefined
    ? undefined
    : (assemblyNameToPanSN(adapter)[name] ?? name)
}

const asmByPrefixCache = new WeakMap<
  BaseFeatureDataAdapter,
  Record<string, string>
>()

// The inverse: PanSN prefix -> the assembly name this session loads it as, for
// naming the lane a haplotype draws on. A mapped assembly counts whether or not
// `assemblyNames` also lists it.
export function assemblyByPanSNPrefix(adapter: BaseFeatureDataAdapter) {
  let out = asmByPrefixCache.get(adapter)
  if (out === undefined) {
    const map = assemblyNameToPanSN(adapter)
    out = {}
    for (const asm of new Set([
      ...Object.keys(map),
      ...(adapter.getConf('assemblyNames') as string[]),
    ])) {
      out[map[asm] ?? asm] = asm
    }
    asmByPrefixCache.set(adapter, out)
  }
  return out
}
