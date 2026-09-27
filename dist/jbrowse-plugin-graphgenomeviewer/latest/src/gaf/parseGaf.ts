// GAF, the graph alignment format that vg giraffe, minigraph and GraphAligner
// write: one read per line, aligned along an oriented walk of segments.
// https://github.com/lh3/gfatools/blob/master/doc/rGFA.md#the-graph-alignment-format-gaf

export interface GafStep {
  name: string
  strand: '+' | '-'
}

export interface GafRecord {
  name: string
  queryLength: number
  queryStart: number
  queryEnd: number
  strand: '+' | '-'
  path: GafStep[]
  // bp of the walk, and where on it the alignment starts and ends
  pathLength: number
  pathStart: number
  pathEnd: number
  matches: number
  blockLength: number
  // 255 is missing
  mappingQuality: number
  secondary: boolean
  cs?: string
}

const STEP = /([><])([^><]+)/g

// A walk of oriented segments; undefined for a path column that names a
// stable sequence instead (`chr1`), which places the read on no segment.
export function parseGafPath(column: string) {
  if (!column.startsWith('>') && !column.startsWith('<')) {
    return undefined
  }
  const steps: GafStep[] = []
  for (const [, arrow, name] of column.matchAll(STEP)) {
    steps.push({ name: name!, strand: arrow === '>' ? '+' : '-' })
  }
  return steps
}

export function parseGafLine(line: string): GafRecord | undefined {
  const columns = line.split('\t')
  if (columns.length < 12 || line.startsWith('#')) {
    return undefined
  }
  const path = parseGafPath(columns[5]!)
  if (!path) {
    return undefined
  }
  let cs: string | undefined
  let secondary = false
  for (let i = 12; i < columns.length; i++) {
    const tag = columns[i]!
    if (tag.startsWith('cs:Z:')) {
      cs = tag.slice(5)
    } else if (tag === 'tp:A:S') {
      secondary = true
    }
  }
  return {
    name: columns[0]!,
    queryLength: +columns[1]!,
    queryStart: +columns[2]!,
    queryEnd: +columns[3]!,
    strand: columns[4] === '-' ? '-' : '+',
    path,
    pathLength: +columns[6]!,
    pathStart: +columns[7]!,
    pathEnd: +columns[8]!,
    matches: +columns[9]!,
    blockLength: +columns[10]!,
    mappingQuality: +columns[11]!,
    secondary,
    ...(cs === undefined ? {} : { cs }),
  }
}

export function parseGaf(text: string) {
  const records: GafRecord[] = []
  for (const line of text.split('\n')) {
    const record = parseGafLine(line.trimEnd())
    if (record) {
      records.push(record)
    }
  }
  return records
}

export type CsOp =
  | { op: 'match'; length: number }
  | { op: 'substitution'; seq: string }
  | { op: 'insertion'; seq: string }
  | { op: 'deletion'; length: number }

const CS_OP =
  /:(\d+)|=([A-Za-z]+)|\*[a-zA-Z]([a-zA-Z])|\+([A-Za-z]+)|-([A-Za-z]+)|~[a-z]{2}(\d+)[a-z]{2}/g

// The cs tag's edits along the walk, in the walk's own orientation. An intron
// (`~`) skips walk the way a deletion does but is not an error of the read, so
// it reads as a match.
export function parseCs(cs: string): CsOp[] {
  const ops: CsOp[] = []
  for (const m of cs.matchAll(CS_OP)) {
    if (m[1] !== undefined) {
      ops.push({ op: 'match', length: +m[1] })
    } else if (m[2] !== undefined) {
      ops.push({ op: 'match', length: m[2].length })
    } else if (m[3] !== undefined) {
      ops.push({ op: 'substitution', seq: m[3].toUpperCase() })
    } else if (m[4] !== undefined) {
      ops.push({ op: 'insertion', seq: m[4].toUpperCase() })
    } else if (m[5] !== undefined) {
      ops.push({ op: 'deletion', length: m[5].length })
    } else if (m[6] !== undefined) {
      ops.push({ op: 'match', length: +m[6] })
    }
  }
  return ops
}
