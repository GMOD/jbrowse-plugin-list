// One row of `gfatools bubble` output. Column order is fixed by gfatools
// main.c (main_bubble): stable sequence, span, then the bubble's shape, three
// `-1` placeholders, the segments it spans, and the two extreme alleles.
//
//   1  stable sequence name        8  longest allele length
//   2  start                       9  -1
//   3  end                        10  -1
//   4  segments in the bubble     11  -1
//   5  paths through it           12  comma-separated segment ids
//   6  1 if it involves an inversion  13  shortest allele sequence, or *
//   7  shortest allele length     14  longest allele sequence, or *
export interface MinigraphBubble {
  refName: string
  start: number
  end: number
  segmentCount: number
  pathCount: number
  inversion: boolean
  shortestAlleleLength: number
  longestAlleleLength: number
  segments: string
  shortestAllele: string | undefined
  longestAllele: string | undefined
  // Set on a bubble derived from the graph itself (bubblesFromGraph.ts) whose
  // reference route leaves the cut, so its lengths are a floor, not a fact.
  partial?: boolean
  // Every distinct route the walks take through a derived bubble, with the
  // walks that take it. Only a graph with walks can state this.
  routes?: BubbleRoute[]
}

export interface BubbleRoute {
  // the node ids between the bubble's two ends, in walk order
  steps: string[]
  bp: number
  walks: string[]
}

// gfatools writes `*` for a zero-length allele (a pure insertion has no
// shorter side), which is the GFA spec's "no sequence here" rather than a
// sequence to show.
function sequence(field: string | undefined) {
  return field === undefined || field === '*' ? undefined : field
}

export function parseBubbleLine(line: string): MinigraphBubble {
  const cols = line.split('\t')
  return {
    refName: cols[0]!,
    start: +cols[1]!,
    end: +cols[2]!,
    segmentCount: +cols[3]!,
    pathCount: +cols[4]!,
    inversion: cols[5] === '1',
    shortestAlleleLength: +cols[6]!,
    longestAlleleLength: +cols[7]!,
    segments: cols[11]!,
    shortestAllele: sequence(cols[12]),
    longestAllele: sequence(cols[13]),
  }
}

// How far apart the two extreme alleles are, which is the concrete thing a
// bubble says: this stretch is between min and max bases long depending on the
// haplotype.
export function bubbleLabel(bubble: MinigraphBubble) {
  const { shortestAlleleLength: min, longestAlleleLength: max } = bubble
  return min === max
    ? `${max.toLocaleString()} bp`
    : `${min.toLocaleString()}-${max.toLocaleString()} bp`
}

// gfatools counts paths into an int32 and clamps at its maximum rather than
// overflowing, so this exact value is a "more than I can count" sentinel and not
// a measurement. 406 of HPRC release 2's 130,510 bubbles hit it.
export const SATURATED_PATH_COUNT = 2147483647

// The rest of the shape, for the description line. `pathCount` is the number of
// ways through the bubble, which is combinatorial rather than a count of
// observed haplotypes: one HLA class II bubble reports over 510 million across
// its 91 segments. Hence "up to", and hence the label above leading with
// lengths.
export function bubbleDescription(bubble: MinigraphBubble) {
  const { pathCount, segmentCount, inversion } = bubble
  return [
    `${segmentCount} segments`,
    pathCount === SATURATED_PATH_COUNT
      ? 'more paths than gfatools counts'
      : `up to ${pathCount.toLocaleString()} paths`,
    ...(inversion ? ['inversion'] : []),
  ].join(', ')
}
