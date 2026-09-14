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
 */
export function genomeHoverToTranscriptPos(
  hovered: unknown,
  mapping: { g2p: Record<number, number>; refName: string } | undefined,
): number | undefined {
  if (!mapping || !checkHovered(hovered)) {
    return undefined
  }
  const { coord, refName } = hovered.hoverPosition
  return refName === mapping.refName ? mapping.g2p[coord - 1] : undefined
}
