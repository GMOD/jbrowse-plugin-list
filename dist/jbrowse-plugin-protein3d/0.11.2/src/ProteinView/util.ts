interface HoveredState {
  hoverPosition: {
    coord: number
    refName: string
  }
}

export function checkHovered(hovered: unknown): hovered is HoveredState {
  return (
    !!hovered &&
    typeof hovered === 'object' &&
    'hoverPosition' in hovered &&
    !!hovered.hoverPosition &&
    typeof hovered.hoverPosition === 'object' &&
    'coord' in hovered.hoverPosition &&
    'refName' in hovered.hoverPosition
  )
}

export function invertMap(arg: Record<number, number>): Record<number, number> {
  return Object.fromEntries(Object.entries(arg).map(([a, b]) => [b, +a]))
}

/**
 * A genome hover, resolved to a 0-based transcript (protein) position.
 *
 * `session.hovered` is global — it is set by whichever LinearGenomeView the
 * cursor was last over, on any assembly — and its `coord` is 1-based display
 * (see pxToBp), hence `coord - 1`. `g2p` is keyed by 0-based genome position on
 * the transcript's *own* refName, so the refName gate is load-bearing: without
 * it the same numeric coordinate on an unrelated chromosome matches a key and
 * reports a residue for a different locus.
 *
 * The two sides name the chromosome independently, so the gate has to compare
 * canonical names. The view reports the assembly's own (`1` on jbrowse.org's
 * hg38), while the mapping carries the feature's, straight out of the file
 * (`chr1` in GENCODE) — equal strings only by luck of which pair of files a
 * config happens to use. Compared raw, every hover on such a config silently
 * missed, which is how it shipped: nothing throws, the residue just never
 * lights up. `canonical` defaults to identity so the pure function stays
 * testable; the model passes the assembly's resolver.
 */
export function genomeHoverToTranscriptPos(
  hovered: unknown,
  mapping: { g2p: Record<number, number>; refName: string } | undefined,
  canonical: (refName: string) => string = r => r,
): number | undefined {
  if (!mapping || !checkHovered(hovered)) {
    return undefined
  }
  const { coord, refName } = hovered.hoverPosition
  return canonical(refName) === canonical(mapping.refName)
    ? mapping.g2p[coord - 1]
    : undefined
}
