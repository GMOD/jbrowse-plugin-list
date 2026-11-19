import { readoutTextPx } from '@jbrowse/bandage-core/layout/walkRowDraw'

// the font walkRowsTree draws a readout in
const READOUT_FONT = '11px sans-serif'

let context: CanvasRenderingContext2D | null | undefined

function measuringContext() {
  if (context === undefined) {
    context = document.createElement('canvas').getContext('2d')
    if (context) {
      context.font = READOUT_FONT
    }
  }
  return context
}

// A readout's width as the pane draws it, measured on a canvas at its font,
// or bandage-core's estimate where there is no canvas to measure on. Every
// placement of a readout, the pan key's and the drawing's alike, takes this
// one function, so they agree on where a readout is cut.
export function measureReadout(text: string) {
  const ctx = measuringContext()
  return ctx ? ctx.measureText(text).width : readoutTextPx(text)
}
