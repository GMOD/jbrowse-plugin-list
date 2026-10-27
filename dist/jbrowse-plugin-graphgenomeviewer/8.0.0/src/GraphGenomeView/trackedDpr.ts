import { getDpr } from '@jbrowse/bandage-core/renderer/canvas'
import { observable, runInAction } from 'mobx'

const ratio = observable.box(
  typeof devicePixelRatio === 'undefined' ? 1 : devicePixelRatio,
)

// A resolution query matches one ratio, so each change re-arms it for the next
function watch() {
  matchMedia(`(resolution: ${devicePixelRatio}dppx)`).addEventListener(
    'change',
    () => {
      runInAction(() => {
        ratio.set(devicePixelRatio)
      })
      watch()
    },
    { once: true },
  )
}

if (typeof matchMedia === 'function') {
  watch()
}

// getDpr() that an autorun or computed re-runs on: a browser zoom or a move to
// another monitor changes the ratio with no event MobX would otherwise see.
// Code painting a 2D context directly passes the canvas size, as
// syncCanvasSize does; a Renderer's transform omits it and the renderer fits.
export function trackedDpr(width = 0, height = 0) {
  ratio.get()
  return getDpr(width, height)
}
