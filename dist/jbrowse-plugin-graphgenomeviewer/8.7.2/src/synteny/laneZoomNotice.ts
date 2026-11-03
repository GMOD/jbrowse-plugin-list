import { isNodeLimitError } from '../nodeLimitError.ts'

/**
 * How many times over the view must zoom in for a lane fetch of `windowBp`
 * to fit, where `fitsBp` is the widest fetch that would: rounded up to a
 * tenth, to a whole number past 10, and never under 1.1.
 */
export function laneZoomFold(windowBp: number, fitsBp: number) {
  const fits = Math.max(1, fitsBp)
  return windowBp >= 10 * fits
    ? Math.ceil(windowBp / fits)
    : Math.max(11, Math.ceil((10 * windowBp) / fits)) / 10
}

/**
 * A budget refusal for lanes, naming how far to zoom rather than a span. The
 * display fetches lanes over the 800 px static blocks its view touches, up to
 * a block past each edge, and never tells the adapter the view, so a span that
 * fits the fetch can be wider than the view. The fetch narrows with the view,
 * so a fold holds for both.
 */
export function laneZoomNotice(error: unknown, windowBp: number) {
  if (isNodeLimitError(error) && error instanceof Error) {
    const { fitsBp } = error as { fitsBp?: unknown }
    error.message = error.message.replace('to see the graph', 'to see lanes')
    if (typeof fitsBp === 'number') {
      error.message = error.message.replace(
        /^Zoom in to about [\d.,]*\d[KM]?bp/,
        `Zoom in about ${laneZoomFold(windowBp, fitsBp)}×`,
      )
    }
  }
  return error
}
