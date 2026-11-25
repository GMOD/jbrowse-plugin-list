export interface HoverPosition {
  /** 1-based */
  coord: number
  refName: string
  /** the genome view the cursor is in, where the host says */
  viewId?: string
}

/** the base a genome view's cursor is over, from `session.hovered` */
export function hoverPosition(hovered: unknown): HoverPosition | undefined {
  const hover = !!hovered && typeof hovered === 'object' ? hovered : undefined
  const pos =
    hover && 'hoverPosition' in hover ? hover.hoverPosition : undefined
  const viewId =
    hover && 'viewId' in hover && typeof hover.viewId === 'string'
      ? hover.viewId
      : undefined
  return !!pos &&
    typeof pos === 'object' &&
    'coord' in pos &&
    typeof pos.coord === 'number' &&
    'refName' in pos &&
    typeof pos.refName === 'string'
    ? { coord: pos.coord, refName: pos.refName, viewId }
    : undefined
}

/** how many entries of an ascending index are below `value` */
export function lowerBound(index: ArrayLike<number>, value: number) {
  let lo = 0
  let hi = index.length
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (index[mid]! < value) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }
  return lo
}
