// Where a drawing's key goes: a column of its own at the pane's right edge,
// which the drawing is fitted beside; over the drawing's top right corner,
// so the drawing takes the pane's whole width; or nowhere
export type KeyPlacement = 'column' | 'overlay' | 'hidden'

export const KEY_PLACEMENT_VALUES: KeyPlacement[] = [
  'column',
  'overlay',
  'hidden',
]

export const DEFAULT_KEY_PLACEMENT: KeyPlacement = 'column'
