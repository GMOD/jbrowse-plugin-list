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
