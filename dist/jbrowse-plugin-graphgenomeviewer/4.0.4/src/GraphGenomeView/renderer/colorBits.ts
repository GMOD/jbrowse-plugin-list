import {
  abgrAlpha,
  abgrBlue,
  abgrGreen,
  abgrRed,
  packAbgr,
} from '@jbrowse/core/util/colorBits'

// The one ABGR helper core does not have. Everything else the renderer needs —
// the packing, the channel accessors, both css formatters — comes straight from
// `@jbrowse/core/util/colorBits`, which is a deep path absent from
// ReExports/list.ts and therefore BUNDLED rather than bound to the host: safe on
// every released JBrowse, whatever its own core exports.
//
// This module used to carry hand-copied versions of all of them, on the stated
// grounds that the published `@jbrowse/core` does not export that subpath. That
// is true and beside the point for a bundled path, and the copies cost nothing
// to drop: esbuild tree-shakes the css colour parsing the rest of that module
// pulls in, so the built plugin is byte-identical either way (37,723 B). What
// the copies did cost is a second statement of the bit layout, which has to
// agree with core's for a colour to survive a round trip through it.

// Scale a packed color's channels, clamped at full brightness and leaving alpha
// alone. factor === 1 returns the color unchanged.
// The same colour at a fraction of its alpha, so a faded node reads as the
// same ink through it on any background.
export function fadeAbgr(c: number, alpha: number) {
  return packAbgr(
    abgrRed(c),
    abgrGreen(c),
    abgrBlue(c),
    Math.round(abgrAlpha(c) * alpha),
  )
}

export function brightenAbgr(c: number, factor: number) {
  return packAbgr(
    Math.min(255, Math.round(abgrRed(c) * factor)),
    Math.min(255, Math.round(abgrGreen(c) * factor)),
    Math.min(255, Math.round(abgrBlue(c) * factor)),
    abgrAlpha(c),
  )
}
