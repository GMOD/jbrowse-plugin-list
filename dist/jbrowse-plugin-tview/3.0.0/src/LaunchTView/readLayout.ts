/** the subset of an @jbrowse/core Feature that the layout reads */
export interface AlignmentFeature {
  get: (key: string) => unknown
}

const text = (value: unknown) => (typeof value === 'string' ? value : '')

/**
 * Only '-' and '.' are treated as gaps by react-msaview (anything else counts
 * as a base in the conservation track and column stats), so the two of them
 * carry the whole vocabulary for "no base here". They are split by meaning:
 *
 * - SPANNED_GAP: the read covers this reference position but aligns no base to
 *   it, i.e. a deletion, or padding in an insertion column
 * - ABSENT: the read is not here at all, i.e. outside its bounds, or skipping
 *   over the position through an N (an intron, not a deleted allele)
 */
export const SPANNED_GAP = '-'
export const ABSENT = '.'
export const GAPS = /[-.]/g

export interface ReadLayout {
  /**
   * Identity, and the row's name in the alignment. Every per-row lookup is
   * keyed by this — the array blocks, the row table — so it is fixed once,
   * here, and nothing downstream rewrites it.
   */
  name: string
  /** the sample the row belongs to, as the caller named it */
  sample?: string
  start: number
  /** one char per reference position consumed: the aligned base, or a gap */
  refChars: string
  /** reference position -> bases inserted immediately before that position */
  insertions: Map<number, string>
  /** where the row's bases came from in the read, for a row parsed from one */
  query?: ReadQuery
}

/**
 * The read's own sequence, SEQ as the file stores it, and enough of its CIGAR
 * to find any base of the row in it: the query index of the first base at
 * `start`, and how many bases the aligner inserted before each position. Kept
 * as parsed, since the layout later moves and drops insertions.
 */
export interface ReadQuery {
  seq: string
  offset: number
  inserted: Map<number, number>
}

const cigarRegex = /([MIDNSHPX=])/

export const byStart = (a: ReadLayout, b: ReadLayout) => a.start - b.start

export function parseCigar(cigar: string) {
  return cigar.split(cigarRegex).slice(0, -1)
}

export function parseRead(
  feature: AlignmentFeature,
  name: string,
  sample?: string,
): ReadLayout {
  const seq = text(feature.get('seq'))
  const ops = parseCigar(text(feature.get('CIGAR')))
  const start = Number(feature.get('start'))
  const insertions = new Map<number, string>()
  const inserted = new Map<number, number>()
  let refChars = ''
  let seqOffset = 0
  let offset: number | undefined

  for (let i = 0; i < ops.length; i += 2) {
    const len = +ops[i]!
    const op = ops[i + 1]!
    if (op !== 'S' && op !== 'H' && op !== 'P') {
      offset ??= seqOffset
    }
    if (op === 'S') {
      seqOffset += len
    } else if (op === 'I') {
      // consecutive I ops (e.g. 3M2I3I3M) land on the same reference position
      const pos = start + refChars.length
      const prev = insertions.get(pos) ?? ''
      insertions.set(pos, prev + seq.slice(seqOffset, seqOffset + len))
      inserted.set(pos, (inserted.get(pos) ?? 0) + len)
      seqOffset += len
    } else if (op === 'D') {
      refChars += SPANNED_GAP.repeat(len)
    } else if (op === 'N') {
      refChars += ABSENT.repeat(len)
    } else if (op === 'M' || op === 'X' || op === '=') {
      refChars += seq.slice(seqOffset, seqOffset + len)
      seqOffset += len
    }
    // H and P consume neither the read sequence nor the reference
  }
  return {
    name,
    sample,
    start,
    refChars,
    insertions,
    query: { seq, offset: offset ?? seqOffset, inserted },
  }
}

/**
 * The query index of the first base a parsed read has at or after reference
 * position `pos`, counting what it inserted at `pos` itself as coming first.
 */
export function queryIndexAt(read: ReadLayout, query: ReadQuery, pos: number) {
  const aligned = read.refChars
    .slice(0, Math.max(0, pos - read.start))
    .replaceAll(GAPS, '').length
  let insertedBefore = 0
  for (const [at, len] of query.inserted) {
    if (at < pos) {
      insertedBefore += len
    }
  }
  return query.offset + aligned + insertedBefore
}

/**
 * Reads are fetched by overlap, so they carry insertions on either side of the
 * region. Those get no columns and are never rendered, so dropping them keeps
 * the pairwise alignment below off the wasted sites entirely.
 */
export function clipInsertions(
  reads: ReadLayout[],
  start: number,
  end: number,
) {
  return reads.map(read => ({
    ...read,
    insertions: new Map(
      [...read.insertions].filter(([pos]) => pos >= start && pos < end),
    ),
  }))
}

function mateSuffix(flags: number | undefined) {
  return flags === undefined || !(flags & 1) ? '' : flags & 64 ? '/1' : '/2'
}

/**
 * MSA rows are keyed by name, and a FASTA defline names its row by the first
 * whitespace-delimited word, dropping any later row whose word repeats. So a
 * name loses its whitespace, mates are told apart by flag, and whatever still
 * collides (the same read in two files, or a name in `reserved`) is numbered.
 */
export function getReadNames(
  features: AlignmentFeature[],
  reserved: string[] = [],
) {
  const taken = new Set(reserved)
  return features.map(f => {
    const flags = f.get('flags')
    const base = `${String(f.get('name')).replaceAll(/\s+/g, '_')}${mateSuffix(typeof flags === 'number' ? flags : undefined)}`
    let name = base
    for (let n = 2; taken.has(name); n++) {
      name = `${base}_${n}`
    }
    taken.add(name)
    return name
  })
}
