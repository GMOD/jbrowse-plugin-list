import useSWR from 'swr'

import { STATIC_SWR_OPTIONS } from './swrOptions'
import {
  type PdbStructureEntry,
  parseBestStructures,
  pdbeBestStructuresUrl,
} from '../services/pdbeBestStructures'

// PDBe answers 404 for an accession with no experimental structure, which is
// the ordinary case for most genes rather than a failure.
async function fetchBestStructures(url: string) {
  const response = await fetch(url)
  if (response.status === 404) {
    return []
  }
  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} fetching ${url} ${await response.text()}`,
    )
  }
  return parseBestStructures(await response.json())
}

export default function usePdbBestStructures(uniprotId: string | undefined) {
  const { data, error, isLoading } = useSWR<PdbStructureEntry[]>(
    uniprotId ? pdbeBestStructuresUrl(uniprotId) : null,
    fetchBestStructures,
    STATIC_SWR_OPTIONS,
  )
  return { entries: data, error, isLoading }
}
