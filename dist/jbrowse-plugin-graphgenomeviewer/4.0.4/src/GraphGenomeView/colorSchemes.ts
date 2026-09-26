// One table drives the persisted enum and both colour dropdowns, the same way
// LAYOUT_MODES drives the layout enum and its menu. The values and their labels
// used to live in two lists in two directories, so adding a scheme meant editing
// both and a mismatch showed up as a dropdown entry that selected nothing.
//
// Kept out of the components directory because the model needs it too.
export const COLOR_SCHEMES = [
  // Mirrors `layoutModes`' 'auto': a value the model resolves rather than a
  // colour of its own. It exists because 'uniform' was the default, so a
  // launched graph opened flat grey and both tutorials spent a step saying "now
  // pick a colour" — one figure literally drives that click. A graph with
  // reference coordinates resolves to 'reference-position', which is the one
  // ramp a linear track beside it can be painted with too; a graph with none
  // keeps 'uniform', because there the ramp would be a hue nothing earned.
  //
  // Resolve through `effectiveColorScheme`; the dropdown reads the raw prop, so
  // "Auto" stays selectable and visible as what it is.
  { value: 'auto', label: 'Auto' },
  { value: 'uniform', label: 'Uniform' },
  { value: 'random', label: 'Random' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'depth', label: 'Depth' },
  { value: 'node-length', label: 'Node Length' },
  { value: 'stable-rank', label: 'Stable rank' },
  { value: 'reference-position', label: 'Reference position' },
  { value: 'grey', label: 'Grey' },
] as const

export type ColorScheme = (typeof COLOR_SCHEMES)[number]['value']

// What the renderer can actually paint with: every scheme except the one that
// stands for "work it out". Stated as its own type so `getNodeColor`'s switch
// has no 'auto' arm to forget.
export type ResolvedColorScheme = Exclude<ColorScheme, 'auto'>

export const COLOR_SCHEME_VALUES = COLOR_SCHEMES.map(s => s.value)
