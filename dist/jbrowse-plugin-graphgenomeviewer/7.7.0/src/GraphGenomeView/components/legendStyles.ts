// A key's section of the legend panel, and one row in it: a swatch beside its
// words
export const legendBoxStyle = {
  background: 'rgba(255,255,255,0.82)',
  padding: '3px 6px',
  fontSize: 11,
  lineHeight: '15px',
  whiteSpace: 'nowrap' as const,
}

export const legendRowStyle = { display: 'flex', alignItems: 'center', gap: 5 }

// A line with no swatch, such as what the drawing folded away
export const legendNoteStyle = { color: '#666' }
