import { jsonfetch, timeout } from '../../fetchUtils'

export const FOLDSEEK_DATABASES = [
  { id: 'pdb100', label: 'PDB (100% redundancy)' },
  { id: 'afdb-swissprot', label: 'AlphaFold DB (Swiss-Prot)' },
  { id: 'afdb50', label: 'AlphaFold DB (50% redundancy)' },
  { id: 'afdb-proteome', label: 'AlphaFold DB (Proteomes)' },
  { id: 'cath50', label: 'CATH (50% redundancy)' },
  { id: 'mgnify_esm30', label: 'MGnify ESM30' },
  { id: 'bfmd', label: 'BFMD' },
  { id: 'gmgcl_id', label: 'GMGCL' },
] as const

export type FoldseekDatabaseId = (typeof FOLDSEEK_DATABASES)[number]['id']

export const DEFAULT_DATABASES: FoldseekDatabaseId[] = [
  'pdb100',
  'afdb-swissprot',
]

export interface FoldseekTicketResponse {
  id: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'ERROR'
  error?: string
}

export interface FoldseekAlignment {
  target: string
  seqId?: number
  alnLength?: number
  mismatches?: number
  gapsopened?: number
  qStartPos?: number
  qEndPos?: number
  qLen?: number
  qAln?: string
  dbStartPos?: number
  dbEndPos?: number
  dbLen?: number
  dbAln?: string
  prob?: number
  eval?: number
  score?: number
  tCa?: string
  tSeq?: string
  taxId?: number
  taxName?: string
  query?: string
}

export interface FoldseekDatabaseResult {
  db: string
  alignments?: ((FoldseekAlignment | undefined)[] | undefined)[]
}

export interface FoldseekResult {
  query: {
    header: string
    sequence: string
  }
  results: FoldseekDatabaseResult[]
}

export async function predict3Di(aaSequence: string) {
  // Clean the sequence - remove FASTA header, whitespace, stop codons, and non-AA chars
  const cleanSequence = aaSequence
    .split('\n')
    .filter(line => !line.startsWith('>'))
    .join('')
    .replace(/\s/g, '')
    .replace(/\*/g, '') // Remove stop codons before querying 3Di
    .toUpperCase()
    .replace(/[^ACDEFGHIKLMNPQRSTVWY]/g, '') // Keep only valid amino acids

  const response = await fetch(
    `https://3di.foldseek.com/predict/${encodeURIComponent(cleanSequence)}`,
  )
  if (!response.ok) {
    throw new Error(
      `3Di prediction failed: ${response.status} ${await response.text()}`,
    )
  }
  const di3Sequence = await response.text()
  // Remove any quotes, slashes, or whitespace from the response
  const cleanDi3 = di3Sequence
    .replace(/^["'/\s]+/, '')
    .replace(/["'/\s]+$/, '')
    .trim()
  return { aaSequence: cleanSequence, di3Sequence: cleanDi3 }
}

export async function submitFoldseekSearch(
  aaSequence: string,
  di3Sequence: string,
  databases: FoldseekDatabaseId[],
) {
  // Submit both AA and 3Di sequences (with trailing newline like working example)
  const fastaContent = `>query\n${aaSequence}\n>3DI\n${di3Sequence}\n`
  const params = new URLSearchParams()
  params.append('q', fastaContent)
  params.append('mode', '3diaa')
  params.append('email', '')
  for (const db of databases) {
    params.append('database[]', db)
  }

  const response = await fetch('https://search.foldseek.com/api/ticket', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  const responseData = await response.json()

  if (!response.ok) {
    throw new Error(
      `Foldseek submission failed: ${response.status} ${JSON.stringify(responseData)}`,
    )
  }

  return responseData as FoldseekTicketResponse
}

export async function pollFoldseekStatus(ticketId: string) {
  // Use the /tickets endpoint (plural) with POST
  const params = new URLSearchParams()
  params.append('tickets[]', ticketId)

  const response = await fetch('https://search.foldseek.com/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  if (!response.ok) {
    throw new Error(`Failed to poll ticket status: ${response.status}`)
  }

  const results = (await response.json()) as FoldseekTicketResponse[]

  // Return the first (and only) result
  const result = results[0]
  if (!result) {
    throw new Error('No ticket status returned')
  }
  return result
}

interface FoldseekApiResponse {
  mode: string
  queries: { header: string; sequence: string }[]
  results: {
    db: string
    alignments: FoldseekAlignment[][]
    taxonomyreports: unknown[]
  }[]
}

export async function getFoldseekResults(
  ticketId: string,
): Promise<FoldseekApiResponse> {
  const result = await jsonfetch(
    `https://search.foldseek.com/api/result/${ticketId}/0`,
  )
  return result as FoldseekApiResponse
}

export async function waitForFoldseekResults(
  ticketId: string,
  databases: FoldseekDatabaseId[],
  onStatusChange?: (status: string) => void,
) {
  const maxAttempts = 180
  let attempts = 0

  while (attempts < maxAttempts) {
    const status = await pollFoldseekStatus(ticketId)

    if (status.status === 'ERROR') {
      console.error('[Foldseek] Search error:', status)
      throw new Error(
        `Foldseek search failed: ${status.error ?? 'Unknown error'}`,
      )
    }

    if (status.status === 'COMPLETE') {
      onStatusChange?.('Fetching results...')
      const apiResponse = await getFoldseekResults(ticketId)

      // Transform API response to our format
      const results: FoldseekResult = {
        query: apiResponse.queries[0] ?? { header: '', sequence: '' },
        results: apiResponse.results.map(r => ({
          db: r.db,
          alignments: r.alignments,
        })),
      }

      return results
    }

    onStatusChange?.(
      `Search ${status.status.toLowerCase()}... (${attempts + 1}s)`,
    )
    await timeout(1000)
    attempts++
  }

  throw new Error('Foldseek search timed out')
}
