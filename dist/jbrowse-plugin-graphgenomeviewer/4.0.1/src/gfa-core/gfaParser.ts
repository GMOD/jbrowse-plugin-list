// Minimal GFA (Graphical Fragment Assembly) text parser shared by the graph
// pangenome plugins (GraphGenomeView, TubeMapView). Handles GFA1/GFA2 segment,
// link, edge, path and walk records plus header tags.

// Only the first two colons delimit a tag; everything after them is the value.
// A Z value may contain colons of its own, and rGFA stable names routinely do
// (`SN:Z:chr1:1-1000` from a sliced reference), where splitting on every colon
// silently truncates the name to `chr1` and mis-anchors the whole layout.
function parseTag(tag: string, tags: Record<string, string | number>) {
  const nameEnd = tag.indexOf(':')
  const typeEnd = tag.indexOf(':', nameEnd + 1)
  if (nameEnd !== -1 && typeEnd !== -1) {
    const name = tag.slice(0, nameEnd)
    const type = tag.slice(nameEnd + 1, typeEnd)
    const val = tag.slice(typeEnd + 1)
    if (type === 'i' || type === 'f') {
      tags[name] = +val
    } else if (type === 'Z') {
      tags[name] = val
    }
  }
}

function parseTags(fields: string[]) {
  const tags: Record<string, string | number> = {}
  for (const field of fields) {
    parseTag(field, tags)
  }
  return tags
}

export interface GFANode {
  id: string
  length: number
  sequence: string
  tags: Record<string, string | number>
}

// rGFA (minigraph) anchors every segment to a reference coordinate: SN is the
// stable sequence name, SO the offset on it, and SR the stable rank, where 0 is
// the reference backbone and higher ranks are the sequence that diverges from
// it. Plain GFA (pggb, odgi, Minigraph-Cactus) carries none of these, which is
// why coordinates there exist only inside the P/W lines.
export interface StableCoordinate {
  refName: string
  start: number
  rank: number
  // How the anchoring path reads this segment. Only path-derived coordinates
  // set it: an rGFA segment is by construction forward on the sequence SN
  // names, so there is nothing there for it to say.
  strand?: '+' | '-'
}

export function stableCoordinate(node: GFANode): StableCoordinate | undefined {
  const { SN, SO, SR } = node.tags
  return typeof SN === 'string' &&
    typeof SO === 'number' &&
    typeof SR === 'number'
    ? { refName: SN, start: SO, rank: SR }
    : undefined
}

export interface GFALink {
  source: string
  target: string
  strand1?: string
  strand2?: string
  cigar: string
  tags: Record<string, string | number>
}

export interface GFAPath {
  name: string
  path: string
  rest: string[]
}

export interface GFAWalkSegment {
  id: string
  strand: string
}

export interface GFAWalk {
  sample: string
  haplotype: number
  contig: string
  start: number
  end: number
  segments: GFAWalkSegment[]
  tags: Record<string, string | number>
}

const GT = 62 // '>'
const LT = 60 // '<'

// A W record's body is `>s1<s2>s3…`, and on a Minigraph-Cactus graph one record
// is the whole walk of one haplotype across a chromosome — hundreds of
// thousands of steps in a single field.
//
// So the ids are cut out by index rather than accumulated a character at a
// time. `current += ch` builds and discards one string per character of every
// id, and it dominated the parse: a file whose single W record walks 200k steps
// went from ~55 ms to ~24 ms by slicing instead. `pnpm bench` keeps the number.
function parseWalkBody(body: string) {
  const segments: GFAWalkSegment[] = []
  let strand = '+'
  let start = 0
  // An empty run — a leading delimiter, or two in a row — names no segment.
  function push(end: number) {
    if (end > start) {
      segments.push({ id: body.slice(start, end), strand })
    }
  }
  for (let i = 0; i < body.length; i++) {
    const ch = body.charCodeAt(i)
    if (ch === GT || ch === LT) {
      push(i)
      strand = ch === GT ? '+' : '-'
      start = i + 1
    }
  }
  push(body.length)
  return segments
}

export interface GFAGraph {
  nodes: GFANode[]
  links: GFALink[]
  paths: GFAPath[]
  walks: GFAWalk[]
  header: Record<string, string | number>[]
  id: string
}

export function parseGFA(file: string) {
  const graph: GFAGraph = {
    nodes: [],
    links: [],
    paths: [],
    walks: [],
    header: [],
    id: '',
  }

  // \r is stripped rather than split on, so a CRLF file does not leave it on
  // whichever field happens to be last: a trailing Z tag would carry it into a
  // stable name and a trailing cigar into the CIGAR string.
  //
  // Stripped per line inside the loop rather than with a .map() over the split,
  // which would hold a second copy of every line in the file at once.
  for (const rawLine of file.split('\n')) {
    const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine
    if (line.startsWith('H')) {
      const [, ...rest] = line.split('\t')
      graph.header.push(parseTags(rest))
    } else if (line.startsWith('S')) {
      const [, name, ...rest] = line.split('\t')
      let len: number
      let seq: string
      let tagfields: string[]
      let gfa1 = false
      // A truncated record has no field to read; `*` is what the spec writes for
      // a segment whose sequence is absent, so treating a missing one the same
      // way yields a 0 bp segment instead of throwing partway through the file.
      const first = rest[0] ?? '*'
      // GFA2 puts an integer length in this field, GFA1 the sequence. Testing
      // the digits rather than the coerced number keeps a GFA2 `S sid 0 *` from
      // being read as a GFA1 sequence of "0".
      if (/^\d+$/.test(first)) {
        len = +first
        seq = rest[1] ?? '*'
        tagfields = rest.slice(2)
      } else {
        gfa1 = true
        seq = first
        // `*` is GFA1's "no sequence here"; its length is whatever LN says
        // below, and 0 if the file states none. Counting the placeholder's own
        // character instead reports every such segment as 1 bp.
        len = seq === '*' ? 0 : seq.length
        tagfields = rest.slice(1)
      }
      const tags = parseTags(tagfields)
      if (gfa1 && 'LN' in tags) {
        len = +tags.LN
      }
      graph.nodes.push({ id: name!, length: len, sequence: seq, tags })
    } else if (line.startsWith('E')) {
      // From here down, a record cut off before the fields that make it a
      // link, walk or path states nothing drawable and is dropped; the file
      // around it still reads. A link missing only its overlap is kept.
      const [, , source, target, , , , , cigar, ...rest] = line.split('\t')
      if (source && target) {
        graph.links.push({
          source: source.slice(0, -1),
          target: target.slice(0, -1),
          strand1: source.at(-1),
          strand2: target.at(-1),
          cigar: cigar ?? '*',
          tags: parseTags(rest),
        })
      }
    } else if (line.startsWith('L')) {
      const [, source, strand1, target, strand2, cigar, ...rest] =
        line.split('\t')
      if (source && target && strand2) {
        graph.links.push({
          source,
          target,
          strand1,
          strand2,
          cigar: cigar ?? '*',
          tags: parseTags(rest),
        })
      }
    } else if (line.startsWith('W')) {
      const [, sample, hap, contig, start, end, body, ...rest] =
        line.split('\t')
      if (sample && hap && contig && start && end && body) {
        graph.walks.push({
          sample,
          haplotype: +hap,
          contig,
          start: start === '*' ? -1 : +start,
          end: end === '*' ? -1 : +end,
          segments: parseWalkBody(body),
          tags: parseTags(rest),
        })
      }
    } else if (line.startsWith('P')) {
      const [, name, path, ...rest] = line.split('\t')
      if (name && path) {
        graph.paths.push({ name, path, rest })
      }
    }
  }
  return graph
}
