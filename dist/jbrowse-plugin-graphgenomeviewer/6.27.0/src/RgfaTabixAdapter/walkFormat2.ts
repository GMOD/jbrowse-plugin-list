import type { WalkChunk, WalkRow } from './walkRows.ts'

// Format 2 of gfa-to-tabix --walks, one file per reference (that repo's
// docs/walks-format.md). A chunk lists its `ref` rows, which joined in
// hapOffset order are the chunk's reference path R; a `nodes` row with the
// lengths of the nodes its routes visit; `route` rows, each a way off R; and a
// `walk` row per piece of every other path, naming the routes it takes in
// order. A handle is 2 * id + 1 when reversed.

const NONE = -1

export interface Route {
  entry: number
  interior: number[]
  exit: number
}

export interface PlacedNode {
  refName: string
  start: number
  end: number
  rank: number
}

const idOf = (handle: number) => (handle - (handle & 1)) / 2

// the other strand's handle; arithmetic, which holds past 2^31
const otherStrand = (handle: number) => (handle & 1 ? handle - 1 : handle + 1)

// The handles a column of delta tokens names, each 2 * (id - previous id) +
// reverse, from `previous.id`, which ends on the last id read
function tokens(field: string, previous: { id: number }, out: number[]) {
  if (field === '.') {
    return out
  }
  let v = 0
  let neg = false
  for (let p = 0; p <= field.length; p++) {
    const ch = p < field.length ? field.charCodeAt(p) : 44
    if (ch === 44) {
      const d = neg ? -v : v
      const r = d & 1
      previous.id += (d - r) / 2
      out.push(previous.id * 2 + r)
      v = 0
      neg = false
    } else if (ch === 45) {
      neg = true
    } else {
      v = v * 10 + (ch - 48)
    }
  }
  return out
}

function numbers(field: string) {
  return field === '.' ? [] : field.split(',').map(Number)
}

// A link the way round the converter writes it, so a link and its reverse
// are one: the smaller of a and the flipped b first
export function canonicalLink(a: number, b: number): [number, number] {
  return a > otherStrand(b) ? [otherStrand(b), otherStrand(a)] : [a, b]
}

function tags(cols: string[], from: number, anchor: string) {
  let prev: WalkChunk | undefined
  let next: WalkChunk | undefined
  for (let k = from; k < cols.length; k++) {
    const tag = cols[k]!
    if (tag.startsWith('pv:') || tag.startsWith('nx:')) {
      const at = tag.lastIndexOf(':')
      const chunk = {
        refName: tag[3] === 'Z' ? tag.slice(5, at) : anchor,
        start: +tag.slice(at + 1),
      }
      if (tag.startsWith('pv:')) {
        prev = chunk
      } else {
        next = chunk
      }
    }
  }
  return { prev, next }
}

// The chunk's reference path R: its handles, the bp of its steps before each
// position, and each node's occurrences in R
export class RefPath {
  readonly handles: number[] = []
  readonly before: number[] = [0]
  readonly occurrences = new Map<number, number[]>()

  add(handles: number[], lengths: number[]) {
    for (let k = 0; k < handles.length; k++) {
      const h = handles[k]!
      const i = this.handles.length
      this.handles.push(h)
      this.before.push(this.before[i]! + lengths[k]!)
      const id = idOf(h)
      const list = this.occurrences.get(id)
      if (list) {
        list.push(i)
      } else {
        this.occurrences.set(id, [i])
      }
    }
  }

  // bp of R's steps before position i
  bp(i: number) {
    return this.before[i]!
  }

  first(handle: number) {
    return this.occurrences.get(idOf(handle))?.[0]
  }

  nearest(handle: number, i: number) {
    let best: number | undefined
    for (const j of this.occurrences.get(idOf(handle)) ?? []) {
      if (best === undefined || Math.abs(j - i) <= Math.abs(best - i)) {
        best = j
      }
    }
    return best
  }

  // The position a stretch along R from position i, reading R the way `h`
  // does there, first holds `target`, i itself included
  reach(i: number, h: number, target: number) {
    const forward = this.handles[i] === h
    let found: number | undefined
    for (const j of this.occurrences.get(idOf(target)) ?? []) {
      if (forward && j >= i && this.handles[j] === target) {
        if (found === undefined || j < found) {
          found = j
        }
      } else if (
        !forward &&
        j <= i &&
        otherStrand(this.handles[j]!) === target
      ) {
        if (found === undefined || j > found) {
          found = j
        }
      }
    }
    return found
  }

  handleAt(i: number, forward: boolean) {
    return forward ? this.handles[i]! : otherStrand(this.handles[i]!)
  }
}

// What a walk row's traversal reports, in step order
interface Visitor {
  // one step: the first, or a route's landing
  step(handle: number): void
  // the steps along R after position `from` up to and including `to`
  stretch(from: number, to: number, forward: boolean): void
  // a route's steps off R, reversed and flipped when `flip`; false stops
  // the traversal
  route(index: number, flip: boolean): boolean
}

export class WalkRowError extends Error {}

const orientedEntry = (route: Route, flip: boolean) =>
  flip ? (route.exit === NONE ? NONE : otherStrand(route.exit)) : route.entry

const orientedExit = (route: Route, flip: boolean) =>
  flip ? (route.entry === NONE ? NONE : otherStrand(route.entry)) : route.exit

// A route's interior handle k, taken the way round `flip` says
const interiorAt = (route: Route, flip: boolean, k: number) =>
  flip
    ? otherStrand(route.interior[route.interior.length - 1 - k]!)
    : route.interior[k]!

// A walk row's choices, three numbers each: route index, flip and step count,
// from `tok` or `tok:count` tokens
function parseChoices(field: string) {
  const choices: number[] = []
  if (field !== '.') {
    let previous = 0
    let v = 0
    let neg = false
    let tok = 0
    let colonSeen = false
    for (let p = 0; p <= field.length; p++) {
      const ch = p < field.length ? field.charCodeAt(p) : 44
      if (ch === 44) {
        const value = neg ? -v : v
        const d = colonSeen ? tok : value
        const r = d & 1
        previous += (d - r) / 2
        choices.push(previous, r, colonSeen ? value : 0)
        v = 0
        neg = false
        colonSeen = false
      } else if (ch === 58) {
        tok = neg ? -v : v
        v = 0
        neg = false
        colonSeen = true
      } else if (ch === 45) {
        neg = true
      } else {
        v = v * 10 + (ch - 48)
      }
    }
  }
  return choices
}

// Follows a walk row as docs/walks-format.md decodes it
function traverse(
  path: RefPath,
  routes: Route[],
  start: number,
  endField: string,
  choices: number[],
  visit: Visitor,
) {
  const colon = endField.indexOf(':')
  const end = start + +(colon < 0 ? endField : endField.slice(0, colon))
  const counted = colon >= 0
  const tail = counted ? +endField.slice(colon + 1) : 0
  const routeOf = (index: number) => {
    const route = routes[index]
    if (!route) {
      throw new WalkRowError(`route ${index} is not in the chunk`)
    }
    return route
  }
  let k = 0
  if (
    choices.length > 0 &&
    orientedEntry(routeOf(choices[0]!), choices[1] === 1) === NONE
  ) {
    if (!visit.route(choices[0]!, choices[1] === 1)) {
      return
    }
    k = 3
  }
  let h = start
  let i = path.first(h)
  if (i === undefined) {
    throw new WalkRowError('a walk row starts off its chunk')
  }
  visit.step(h)
  const follow = (target: number, count: number) => {
    const forward = path.handles[i!] === h
    const j = counted
      ? i! + (forward ? count : -count)
      : path.reach(i!, h, target)
    if (j === undefined || j < 0 || j >= path.handles.length) {
      throw new WalkRowError('a walk row runs off its chunk')
    }
    if (j !== i) {
      visit.stretch(i!, j, forward)
    }
    i = j
    h = path.handleAt(j, forward)
  }
  for (; k < choices.length; k += 3) {
    const index = choices[k]!
    const flip = choices[k + 1] === 1
    const route = routeOf(index)
    const entry = orientedEntry(route, flip)
    if (entry === NONE) {
      throw new WalkRowError('an open route after the first choice')
    }
    follow(entry, choices[k + 2]!)
    if (!visit.route(index, flip)) {
      return
    }
    const exit = orientedExit(route, flip)
    if (exit === NONE) {
      return
    }
    h = exit
    i = path.nearest(h, i)
    if (i === undefined) {
      throw new WalkRowError('a route lands off its chunk')
    }
    visit.step(h)
  }
  follow(end, tail)
  if (h !== end) {
    throw new WalkRowError('a walk row misses its last handle')
  }
}

// A walk row's steps as node ids and reverse flags
function decodeWalk(
  path: RefPath,
  routes: Route[],
  cols: string[],
  choices: number[],
  n: number,
) {
  const ids = new Int32Array(n)
  const rev = new Uint8Array(n)
  let at = 0
  const push = (h: number) => {
    if (at >= n) {
      throw new WalkRowError('a walk row decodes to more steps than it states')
    }
    ids[at] = idOf(h)
    rev[at++] = h & 1
  }
  traverse(path, routes, +cols[9]!, cols[10]!, choices, {
    step: push,
    stretch(from, to, forward) {
      if (forward) {
        for (let j = from + 1; j <= to; j++) {
          push(path.handles[j]!)
        }
      } else {
        for (let j = from - 1; j >= to; j--) {
          push(otherStrand(path.handles[j]!))
        }
      }
    },
    route(index, flip) {
      const route = routes[index]!
      for (let k = 0; k < route.interior.length; k++) {
        push(interiorAt(route, flip, k))
      }
      return true
    },
  })
  if (at !== n) {
    throw new WalkRowError(`a walk row decodes to ${at} steps, not ${n}`)
  }
  return { ids, rev }
}

// A chunk as decoded, kept until the cut knows its nodes: tables() then
// places the cut's nodes off R and lists the links among them
export interface Format2Chunk {
  path: RefPath
  routes: Route[]
  // walk rows in path-name order, choices parsed
  walks: { cols: string[]; choices: number[] }[]
  lengths: Map<number, number>
}

export interface DecodedChunk {
  // the reference's rows and the kept walk rows, steps decoded
  rows: WalkRow[]
  // R's nodes with their positions, and the kept walks' nodes off R with
  // their lengths, placed by placeAndLink
  nodes: Map<number, PlacedNode>
  // every row's first and last handle, for links between pieces
  ends: {
    name: string
    fragStart: number
    piece: number
    first: number
    last: number
  }[]
  chunk: Format2Chunk
}

/**
 * Decodes one chunk's rows, each split on tabs. `keep` names the walk rows
 * whose steps a cut wants, undefined for every one.
 */
export function decodeChunk(
  rows: string[][],
  keep: ((name: string) => boolean) | undefined,
): DecodedChunk {
  const path = new RefPath()
  const lengths = new Map<number, number>()
  const routes: Route[] = []
  const out: DecodedChunk = {
    rows: [],
    nodes: new Map(),
    ends: [],
    chunk: { path, routes, walks: [], lengths },
  }
  const previous = { id: 0 }
  const refs = rows.filter(c => c[3] === 'ref').sort((a, b) => +a[6]! - +b[6]!)
  for (const cols of refs) {
    const anchor = cols[0]!
    const handles = tokens(cols[9]!, { id: 0 }, [])
    const nodeLengths = numbers(cols[10]!)
    const hapOffset = +cols[6]!
    path.add(handles, nodeLengths)
    let start = hapOffset
    for (let k = 0; k < handles.length; k++) {
      const id = idOf(handles[k]!)
      const length = nodeLengths[k]!
      lengths.set(id, length)
      if (!out.nodes.has(id)) {
        out.nodes.set(id, {
          refName: cols[4]!,
          start,
          end: start + length,
          rank: 0,
        })
      }
      start += length
    }
    out.ends.push({
      name: cols[4]!,
      fragStart: +cols[5]!,
      piece: +cols[7]!,
      first: handles[0]!,
      last: handles.at(-1)!,
    })
    if (keep === undefined || keep(cols[4]!)) {
      out.rows.push({
        chunkStart: +cols[1]!,
        name: cols[4]!,
        fragStart: +cols[5]!,
        hapOffset,
        piece: +cols[7]!,
        n: handles.length,
        enc: '',
        steps: {
          ids: Int32Array.from(handles, idOf),
          rev: Uint8Array.from(handles, h => h & 1),
        },
        ...tags(cols, 11, anchor),
      })
    }
  }
  for (const cols of rows) {
    if (cols[3] === 'nodes') {
      const ids = numbers(cols[4]!)
      const nodeLengths = numbers(cols[5]!)
      let id = 0
      for (let k = 0; k < ids.length; k++) {
        id += ids[k]!
        lengths.set(id, nodeLengths[k]!)
      }
    } else if (cols[3] === 'route') {
      const entry = tokens(cols[4]!, previous, [])
      const interior = tokens(cols[5]!, previous, [])
      const exit = tokens(cols[6]!, previous, [])
      routes.push({ entry: entry[0] ?? NONE, interior, exit: exit[0] ?? NONE })
    }
  }
  const routeOf = (index: number) => {
    const route = routes[index]
    if (!route) {
      throw new WalkRowError(`route ${index} is not in the chunk`)
    }
    return route
  }
  for (const cols of rows) {
    if (cols[3] !== 'walk') {
      continue
    }
    const choices = parseChoices(cols[11]!)
    out.chunk.walks.push({ cols, choices })
    const name = cols[4]!
    const start = +cols[9]!
    const endField = cols[10]!
    const colon = endField.indexOf(':')
    let first = start
    let last = start + +(colon < 0 ? endField : endField.slice(0, colon))
    if (choices.length > 0) {
      const lead = routeOf(choices[0]!)
      const leadFlip = choices[1] === 1
      if (orientedEntry(lead, leadFlip) === NONE) {
        first = interiorAt(lead, leadFlip, 0)
      }
      const at = choices.length - 3
      const tail = routeOf(choices[at]!)
      const tailFlip = choices[at + 1] === 1
      if (orientedExit(tail, tailFlip) === NONE) {
        last = interiorAt(tail, tailFlip, tail.interior.length - 1)
      }
    }
    out.ends.push({
      name,
      fragStart: +cols[5]!,
      piece: +cols[7]!,
      first,
      last,
    })
    if (keep === undefined || keep(name)) {
      const n = +cols[8]!
      // the walk's nodes off R, by length; placeAndLink gives their position
      for (let k = 0; k < choices.length; k += 3) {
        for (const h of routeOf(choices[k]!).interior) {
          const id = idOf(h)
          if (!out.nodes.has(id)) {
            const length = lengths.get(id) ?? 0
            out.nodes.set(id, { refName: name, start: 0, end: length, rank: 1 })
          }
        }
      }
      out.rows.push({
        chunkStart: +cols[1]!,
        name,
        fragStart: +cols[5]!,
        hapOffset: +cols[6]!,
        piece: +cols[7]!,
        n,
        enc: '',
        steps: decodeWalk(path, routes, cols, choices, n),
        ...tags(cols, 12, cols[0]!),
      })
    }
  }
  return out
}

/**
 * The positions of the cut's nodes off R, and the links among the cut's
 * nodes, from the chunks a cut read: `kept` holds the node ids the cut draws.
 * A node off R takes its position from the path whose name sorts first among
 * those visiting it in the chunks read, at its earliest offset, as format 1's
 * node rows had it. Links are R's and the routes', both ends in the cut.
 */
export function placeAndLink(
  chunks: Format2Chunk[],
  kept: Set<number>,
  place: (id: number, node: PlacedNode) => void,
  link: (a: number, b: number) => void,
) {
  const best = new Map<number, PlacedNode>()
  for (const { path, routes, walks, lengths } of chunks) {
    const handles = path.handles
    for (let k = 1; k < handles.length; k++) {
      if (kept.has(idOf(handles[k - 1]!)) && kept.has(idOf(handles[k]!))) {
        link(...canonicalLink(handles[k - 1]!, handles[k]!))
      }
    }
    // routes holding a node of the cut off R
    const wanted = new Uint8Array(routes.length)
    for (let index = 0; index < routes.length; index++) {
      const { entry, interior, exit } = routes[index]!
      let any = false
      let from = entry
      for (const h of interior) {
        const inCut = kept.has(idOf(h))
        any ||= inCut
        if (inCut && from !== NONE && kept.has(idOf(from))) {
          link(...canonicalLink(from, h))
        }
        from = h
      }
      if (
        from !== NONE &&
        exit !== NONE &&
        kept.has(idOf(from)) &&
        kept.has(idOf(exit))
      ) {
        link(...canonicalLink(from, exit))
      }
      wanted[index] = any ? 1 : 0
    }
    const lengthOf = (h: number) => lengths.get(idOf(h)) ?? 0
    const bp = new Float64Array(routes.length).fill(-1)
    const routeBp = (index: number) => {
      if (bp[index]! < 0) {
        bp[index] = routes[index]!.interior.reduce((s, h) => s + lengthOf(h), 0)
      }
      return bp[index]!
    }
    // Walk rows run in path-name order, so a route's first taker is the
    // first-named path to reach its nodes here; each row is followed only as
    // far as the last route it is first to take
    const taken = new Uint8Array(routes.length)
    for (const { cols, choices } of walks) {
      let remaining = 0
      for (let k = 0; k < choices.length; k += 3) {
        const index = choices[k]!
        if (wanted[index] && !taken[index]) {
          remaining++
        }
      }
      if (remaining === 0) {
        continue
      }
      const name = cols[4]!
      let offset = +cols[6]!
      traverse(path, routes, +cols[9]!, cols[10]!, choices, {
        step(h) {
          offset += lengthOf(h)
        },
        stretch(from, to, forward) {
          offset += forward
            ? path.bp(to + 1) - path.bp(from + 1)
            : path.bp(from) - path.bp(to)
        },
        route(index, flip) {
          if (!wanted[index] || taken[index]) {
            offset += routeBp(index)
            return true
          }
          taken[index] = 1
          const route = routes[index]!
          for (let k = 0; k < route.interior.length; k++) {
            const h = interiorAt(route, flip, k)
            const id = idOf(h)
            const length = lengthOf(h)
            if (kept.has(id)) {
              const held = best.get(id)
              if (
                !held ||
                name < held.refName ||
                (name === held.refName && offset < held.start)
              ) {
                best.set(id, {
                  refName: name,
                  start: offset,
                  end: offset + length,
                  rank: 1,
                })
              }
            }
            offset += length
          }
          remaining--
          return remaining > 0
        },
      })
    }
  }
  for (const [id, node] of best) {
    place(id, node)
  }
}

// The reference's nodes in a chunk's ref rows, with their positions
export function referenceNodes(rows: string[][]) {
  const nodes: (PlacedNode & { id: number })[] = []
  for (const cols of rows) {
    if (cols[3] !== 'ref') {
      continue
    }
    const handles = tokens(cols[9]!, { id: 0 }, [])
    const nodeLengths = numbers(cols[10]!)
    let start = +cols[6]!
    for (let k = 0; k < handles.length; k++) {
      const length = nodeLengths[k]!
      nodes.push({
        id: idOf(handles[k]!),
        refName: cols[4]!,
        start,
        end: start + length,
        rank: 0,
      })
      start += length
    }
  }
  return nodes
}

// Links between consecutive pieces of a path, each piece's last step to the
// next one's first, among the pieces read
export function pieceLinks(ends: DecodedChunk['ends']) {
  const byPath = new Map<string, Map<number, { first: number; last: number }>>()
  for (const e of ends) {
    const key = `${e.name}\t${e.fragStart}`
    let pieces = byPath.get(key)
    if (!pieces) {
      pieces = new Map()
      byPath.set(key, pieces)
    }
    pieces.set(e.piece, e)
  }
  const links: [number, number][] = []
  for (const pieces of byPath.values()) {
    for (const [piece, e] of pieces) {
      const next = pieces.get(piece + 1)
      if (next) {
        links.push(canonicalLink(e.last, next.first))
      }
    }
  }
  return links
}
