// A key's box over the drawing, and one row in it: a swatch beside its words
export const legendBoxStyle = {
  background: 'rgba(255,255,255,0.82)',
  padding: '4px 6px',
  borderRadius: 3,
  fontSize: 11,
  lineHeight: '15px',
  whiteSpace: 'nowrap' as const,
}

// getNodeColor's grey for a node the ramp cannot place
export const UNPLACED_SWATCH = 'rgb(160, 160, 160)'

export const legendRowStyle = { display: 'flex', alignItems: 'center', gap: 5 }
