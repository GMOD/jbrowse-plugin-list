// A key's box over the drawing, and one row in it: a swatch beside its words
export const legendBoxStyle = {
  background: 'rgba(255,255,255,0.82)',
  padding: '4px 6px',
  borderRadius: 3,
  fontSize: 11,
  lineHeight: '15px',
  whiteSpace: 'nowrap' as const,
}

export const legendRowStyle = { display: 'flex', alignItems: 'center', gap: 5 }

// a faded node: grey at the fade's alpha
export const FADED_SWATCH = 'rgba(160, 160, 160, 0.18)'
