import SyntenyFeature from './SyntenyFeature.ts'

export interface MatchSide {
  name: string
  assemblyName: string
  refName: string
  start: number
  end: number
}

/**
 * One record of a walk aligned to another, on the target walk's contig with
 * the query walk as its mate and the CIGAR read along the target, a `D` being
 * target bases the query lacks. Each side's walk name and extent make the id.
 */
export function matchFeature({
  target,
  query,
  strand,
  cigar,
  matches,
  columns,
}: {
  target: MatchSide
  query: MatchSide
  strand: string
  cigar: string
  matches: number
  columns: number
}) {
  const id = `${target.name}:${target.start}-${target.end}|${query.name}:${query.start}-${query.end}`
  return new SyntenyFeature({
    uniqueId: id,
    assemblyName: target.assemblyName,
    refName: target.refName,
    start: target.start,
    end: target.end,
    type: 'match',
    strand: strand === '-' ? -1 : 1,
    CIGAR: cigar,
    syntenyId: id,
    identity: matches / Math.max(columns, 1),
    numMatches: matches,
    blockLen: columns,
    mate: {
      refName: query.refName,
      start: query.start,
      end: query.end,
      assemblyName: query.assemblyName,
    },
  })
}
