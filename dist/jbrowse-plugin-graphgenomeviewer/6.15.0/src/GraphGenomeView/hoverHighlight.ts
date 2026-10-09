// What the pointer lights: nothing, a hovered node, or also an edge under it
// and the node at a linear view's pointer bp
export type HoverHighlight = 'off' | 'nodes' | 'everything'

export const HOVER_HIGHLIGHT_VALUES: HoverHighlight[] = [
  'off',
  'nodes',
  'everything',
]
