/**
 * Pure geometry for the alignment panel's auto-scrolling, extracted so it can be
 * unit-tested independently of the DOM/mobx effects that drive it. All values
 * are in pixels within the horizontally-scrolling alignment container.
 */

/**
 * Target scrollLeft for following a hovered column, but only on a *large jump* —
 * a column that lands more than a full viewport outside the view (e.g. hovering
 * a distant residue in the 3D structure). A column that has merely edged just
 * off-screen during a continuous hover sweep returns undefined, so the panel
 * doesn't feel like it's constantly re-centering. Centers the column when it
 * does jump.
 */
export function largeJumpScrollTarget({
  x,
  scrollLeft,
  clientWidth,
}: {
  x: number
  scrollLeft: number
  clientWidth: number
}): number | undefined {
  const viewEnd = scrollLeft + clientWidth
  const gap = Math.max(scrollLeft - x, x - viewEnd)
  return gap > clientWidth ? x - clientWidth / 2 : undefined
}

/**
 * Target scrollLeft to bring a selected [start, end) pixel range into view,
 * centering it, but only when it currently lies entirely off-screen. Returns
 * undefined when any part of the range is already visible, so a selection the
 * user can already see is left where it is.
 */
export function offScreenCenterTarget({
  start,
  end,
  scrollLeft,
  clientWidth,
}: {
  start: number
  end: number
  scrollLeft: number
  clientWidth: number
}): number | undefined {
  const viewEnd = scrollLeft + clientWidth
  const visible = end >= scrollLeft && start <= viewEnd
  return visible ? undefined : (start + end) / 2 - clientWidth / 2
}
