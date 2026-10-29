export interface Pinned {
  refName: string
  start: number
  end: number
}

export type FloorBp = number | 'auto'

export function pinnedOf(value: unknown): Pinned | undefined {
  const { refName, start, end } = (value ?? {}) as Partial<Pinned>
  return typeof refName === 'string' &&
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    start! < end!
    ? { refName, start: start!, end: end! }
    : undefined
}

export function floorOf(value: unknown): FloorBp {
  const n = Number(value)
  return value !== 'auto' && Number.isFinite(n) ? n : 'auto'
}

const n = (x: number) => x.toLocaleString('en-US')

// 1-based and closed, as a locus box reads
export const pinnedLocus = ({ refName, start, end }: Pinned) =>
  `${refName}:${n(start + 1)}-${n(end)}`

// Names the window in each warning toast, so a re-pin or floor change can take
// the old ones down
export const warningPrefix = (pinned: Pinned) =>
  `Forms of ${pinnedLocus(pinned)}: `
