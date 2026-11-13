import { reaction } from 'mobx'

export function followHoverTarget({
  x,
  width,
  scrollLeft,
  clientWidth,
}: {
  x: number
  width: number
  scrollLeft: number
  clientWidth: number
}): number | undefined {
  const visible = x >= scrollLeft && x + width <= scrollLeft + clientWidth
  return visible ? undefined : x + width / 2 - clientWidth / 2
}

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

interface HoverFollower {
  alignmentHoverPos: number | undefined
  autoScrollAlignment: boolean
  isMouseInAlignment: boolean
  columnWidth: number
}

interface ScrollContainer {
  scrollLeft: number
  clientWidth: number
}

export function followHover(
  model: HoverFollower,
  getContainer: () => ScrollContainer | null,
) {
  return reaction(
    () => model.alignmentHoverPos,
    pos => {
      const container = getContainer()
      if (
        pos !== undefined &&
        container &&
        model.autoScrollAlignment &&
        !model.isMouseInAlignment
      ) {
        const target = followHoverTarget({
          x: pos * model.columnWidth,
          width: model.columnWidth,
          scrollLeft: container.scrollLeft,
          clientWidth: container.clientWidth,
        })
        if (target !== undefined) {
          container.scrollLeft = target
        }
      }
    },
  )
}
