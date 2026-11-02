// A key's section of the legend panel, and one row in it: a swatch beside its
// words
export const legendBoxStyle = {
  background: '#fff',
  padding: '3px 6px',
  fontSize: 11,
  lineHeight: '15px',
  whiteSpace: 'nowrap' as const,
}

export const legendRowStyle = { display: 'flex', alignItems: 'center', gap: 5 }

// A line with no swatch, such as what the drawing folded away
export const legendNoteStyle = { color: '#666' }

export const HEADING_INK = '#6b7479'
export const HEADING_GAP_PX = 4

// A group's name over its rows, set apart by a gap unless it opens the key
export const legendHeadingStyle = {
  color: HEADING_INK,
  fontSize: 9.5,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
}
