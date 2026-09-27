import { pathOrigin } from './pathAnchoring'

import type { GraphPath } from './types'

// Deterministic colour from a string (djb2-style hash to an HSL hue). Fine for
// the `random` node scheme, where a collision between two of thousands of nodes
// means nothing. NOT what the path ribbons use: see pathHueAt.
export function nameHue(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash % 360)
}

// Ribbon hues are spread evenly over the wheel by position in the path list,
// not hashed from the path name. A hash draws from the wheel at random, and at
// five paths two of them landing on the same hue is common rather than
// unlucky: `Sakai#1#chr:1983339-1983535` and `NCTC86#1#chr:1709109-1710286`
// hash 26 degrees apart, which is two purples and a legend that cannot be read
// off the drawing. Evenly spaced, the worst case is the best available.
//
// The cost is that a path's colour depends on how many paths there are, so it
// moves when the cut changes. That is what the legend is for, and it is the
// same trade the Bandage demo this was ported from made.
export function pathHueAt(index: number, count: number) {
  return (index * 360) / count
}

export const PATH_SATURATION = 0.7
export const PATH_LIGHTNESS = 0.5

// Past this many paths a graph cannot be drawn per path at all, and the WHOLE
// of `drawPaths` goes off with it: the node stripes, the edge ribbons and the
// key naming them.
//
// One number for all three because they are one statement, and they used to
// disagree. Only the stripes were capped. So a Minigraph-Cactus cut, which
// writes one W record per haplotype and walks every backbone link with all of
// them, drew: no stripes at all, a key hundreds of rows tall, and one bezier
// stroke per path per edge — measured at 99,800 strokes and 64 ms of geometry
// for 200 paths over 499 links, against 2,495 strokes for the five-path pggb
// cut the figures use. Every one of those is its own `beginPath`/`stroke` on
// the Canvas2D backend, every frame.
//
// 16 is where the drawing stops SAYING anything, not where it stops being fast.
// `pathHueAt` spreads the wheel evenly, so 16 hues are 22 degrees apart and
// still tellable and 200 are one degree; the ribbon fan is PATH_RIBBON_SPACING
// per path, so 16 of them is a legible fan and 200 is a band wider than the
// nodes; and a key past about 16 rows is taller than the drawing beside it.
// Above the cap the honest picture is the plain one — which is exactly what a
// graph carrying no paths at all already draws.
export const MAX_PATH_COLORS = 16

// Whether this graph's paths can be drawn as colours. Resolve it once and hand
// the answer down: the geometry, the hit index and the key each used to decide
// for themselves, which is how they came to disagree.
export function pathColorsLegible(pathCount: number) {
  return pathCount > 0 && pathCount <= MAX_PATH_COLORS
}

export function pathCssColor(index: number, count: number) {
  return `hsl(${pathHueAt(index, count)}, ${PATH_SATURATION * 100}%, ${
    PATH_LIGHTNESS * 100
  }%)`
}

// A path is named the way its file names it — `K12#1#chr:1004500-1004961` for a
// P record `odgi extract` wrote, `HG00738#1` for a W record — and neither is a
// legend entry. The label is the least of that name which still tells the paths
// apart: the sample where samples are unique, the haplotype too where they are
// not, the whole stable name where even that repeats. Widening it for every row
// rather than only for the colliding ones, because a legend where one entry is
// `HG00738#1` and its neighbour is `HG01071` reads as two kinds of thing.
function labelTiers(name: string) {
  const parts = pathOrigin(name).name.split('#')
  return [parts[0]!, parts.slice(0, 2).join('#'), parts.join('#')]
}

// Locale-independent, unlike toLocaleString: a figure regenerated on a machine
// with a different locale would otherwise differ from the committed one.
function groupDigits(n: number) {
  return String(n).replace(/\B(?=(\d{3})+$)/g, ',')
}

// A collapsed repeat puts one sequence through the same segments more than
// once, and `odgi extract` emits one path per visit — nine visits over five
// E. coli chromosomes at the rRNA operons, where every name tier above collides
// because the sequence really is the same one. What separates those is the
// offset each name carried, which is the one thing pathOrigin strips off.
function offsetTiers(name: string, tiers: string[]) {
  const { start } = pathOrigin(name)
  return tiers.map(t => `${t} @${groupDigits(start)}`)
}

export interface PathLegendEntry {
  name: string
  label: string
  color: string
}

export function pathLegend(paths: GraphPath[]): PathLegendEntry[] {
  const named = paths.map(p => labelTiers(p.name))
  // narrowest first, and the offset is tried before the next name tier: two
  // copies of one operon are told apart by where they are, not by widening a
  // name that is genuinely identical
  const candidates = [0, 1, 2].flatMap(t => [
    paths.map((_, i) => named[i]![t]!),
    paths.map((p, i) => offsetTiers(p.name, named[i]!)[t]!),
  ])
  const distinct = candidates.find(
    labels => new Set(labels).size === paths.length,
  )
  // Nothing separates two paths with the same name and the same offset, so the
  // widest labelling is as close as any can get.
  const labels = distinct ?? candidates.at(-1)!
  return paths.map((path, i) => ({
    name: path.name,
    label: labels[i]!,
    color: pathCssColor(i, paths.length),
  }))
}
