import { getConfigUrls } from './configUrls'

interface Description {
  assembly: HubAssembly
  geneAdapter?: Record<string, unknown>
}

interface HubAssembly {
  name: string
  aliases?: string[]
}

interface HubConfig {
  assemblies?: HubAssembly[]
  tracks?: { trackId: string; adapter?: Record<string, unknown> }[]
}

// jb2hubs' defaultGeneTrackId order, which also picks the track minimal.json
// keeps and a hub genome's default session opens
const GENE_TRACK_SUFFIXES = [
  'ncbiRefSeq',
  'ncbiRefSeqCurated',
  'ncbiGene',
  'refGene',
  'ensGene',
  'augustusGene',
  'xenoRefGene',
]

// A TwoBit adapter's bare `chromSizes` resolves against the `baseUri` beside
// its `uri`, so rewriting each `uri` alone sent jb2hubs' relative chrom.sizes
// to the page's origin
function withBaseUri<T>(value: T, base: string): T {
  if (Array.isArray(value)) {
    return value.map(item => withBaseUri(item, base)) as T
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value).map(([key, item]) => [
      key,
      withBaseUri(item, base),
    ])
    return Object.fromEntries(
      typeof (value as { uri?: unknown }).uri === 'string' &&
        !('baseUri' in value)
        ? [...entries, ['baseUri', base]]
        : entries,
    ) as T
  }
  return value
}

export function describeFromConfig(
  config: HubConfig,
  assemblyName: string,
  configUrl: string,
): Description | undefined {
  const assembly = config.assemblies?.find(
    a => a.name === assemblyName || a.aliases?.includes(assemblyName),
  )
  if (!assembly) {
    return undefined
  }
  const tracks = new Map(config.tracks?.map(track => [track.trackId, track]))
  const geneAdapter = GENE_TRACK_SUFFIXES.map(
    suffix => tracks.get(`${assembly.name}-${suffix}`)?.adapter,
  ).find(adapter => adapter !== undefined)
  return {
    assembly: withBaseUri(assembly, configUrl),
    geneAdapter: geneAdapter && withBaseUri(geneAdapter, configUrl),
  }
}

// throws on anything but a found config or a 404, so only a definitive
// answer is cached
async function fetchDescription(assemblyName: string) {
  for (const url of getConfigUrls(assemblyName)) {
    const response = await fetch(url)
    if (response.ok) {
      const config = (await response.json()) as HubConfig
      return describeFromConfig(config, assemblyName, url)
    }
    if (response.status !== 404) {
      throw new Error(`${url}: HTTP ${response.status}`)
    }
  }
  return undefined
}

const descriptions = new Map<string, Promise<Description | undefined>>()

function describe(assemblyName: string) {
  let description = descriptions.get(assemblyName)
  if (!description) {
    description = fetchDescription(assemblyName).catch((error: unknown) => {
      descriptions.delete(assemblyName)
      console.error(error)
      return undefined
    })
    descriptions.set(assemblyName, description)
  }
  return description
}

/**
 * Core-describeAssemblies: the assembly config and gene track adapter the
 * hosted config of each named genome holds, read without connecting it. A
 * name another plugin already described, or one no hosted config could hold,
 * is left alone
 */
export async function describeAssemblies(
  described: unknown,
  assemblyNames: unknown,
) {
  const before =
    typeof described === 'object' && described !== null ? described : {}
  const names = Array.isArray(assemblyNames)
    ? assemblyNames.filter((name): name is string => typeof name === 'string')
    : []
  const answers = await Promise.all(
    names
      .filter(
        name => !Object.hasOwn(before, name) && getConfigUrls(name).length > 0,
      )
      .map(async name => [name, await describe(name)] as const),
  )
  return {
    ...before,
    ...Object.fromEntries(
      answers.filter(([, description]) => description !== undefined),
    ),
  }
}
