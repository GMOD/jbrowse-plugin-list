export type MismatchKind = 'similar' | 'different'

export interface MismatchRun {
  /** half-open alignment columns */
  start: number
  end: number
  kind: MismatchKind
}

function mismatchKind(
  transcript: string | undefined,
  structure: string | undefined,
  consensus: string | undefined,
): MismatchKind | undefined {
  if (
    !transcript ||
    !structure ||
    transcript === '-' ||
    structure === '-' ||
    transcript.toUpperCase() === structure.toUpperCase()
  ) {
    return undefined
  }
  return consensus === ':' || consensus === '.' ? 'similar' : 'different'
}

/**
 * The columns where both sequences carry a residue and the residues differ,
 * split by whether the substitution is a conservative one (the consensus
 * row's `:`), in runs. This is what the consensus row used to spell out with
 * `|`, `:` and blanks, on a row of its own; the STRUCT row now shades these
 * columns instead. Gaps are left alone, since the `-` already says so.
 */
export function mismatchRuns(alignment: {
  alns: readonly { seq: string }[]
  consensus: string
}): MismatchRun[] {
  const transcript = alignment.alns[0]?.seq ?? ''
  const structure = alignment.alns[1]?.seq ?? ''
  const runs: MismatchRun[] = []
  for (let i = 0; i < transcript.length; i++) {
    const kind = mismatchKind(
      transcript[i],
      structure[i],
      alignment.consensus[i],
    )
    const last = runs.at(-1)
    if (kind && last?.kind === kind && last.end === i) {
      last.end = i + 1
    } else if (kind) {
      runs.push({ start: i, end: i + 1, kind })
    }
  }
  return runs
}
