export const CHAR_WIDTH = 6
export const ROW_HEIGHT = 12
export const COMPACT_TRACK_HEIGHT = 8
export const COMPACT_TRACK_GAP = 1
export const NORMAL_TRACK_HEIGHT = 12
export const NORMAL_TRACK_GAP = 2
export const LABEL_WIDTH = 124

export const MINOR_FEATURE_TYPES = new Set([
  'Chain',
  'Helix',
  'Turn',
  'Beta strand',
  'Compositional bias',
  'Modified residue',
  'Glycosylation',
  'Lipidation',
  'Cross-link',
  'Alternative sequence',
  'Sequence conflict',
  'Initiator methionine',
])

// one colour per interaction state, drawn across every row of the panel
export const HOVER_COLOR = 'rgba(255, 105, 180, 0.5)'
export const HOVER_RANGE_COLOR = 'rgba(255, 165, 0, 0.35)'
export const SELECTION_COLOR = 'rgba(0, 120, 255, 0.25)'
export const SELECTION_OUTLINE = '1px solid rgba(0, 120, 255, 0.6)'
export const MATCH_COLOR = '#33ff19a0'

// a structure residue that differs from the transcript's, by how much
export const SIMILAR_RESIDUE_COLOR = 'rgba(230, 160, 0, 0.3)'
export const DIFFERENT_RESIDUE_COLOR = 'rgba(220, 40, 40, 0.3)'

export const SELECTED_BORDER = '2px solid #333'
export const HOVERED_BORDER = '1px solid black'
export const HIDE_BUTTON_COLOR = '#999'
