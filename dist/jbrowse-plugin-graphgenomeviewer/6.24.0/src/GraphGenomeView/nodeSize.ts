import { isRecord } from '../isRecord'

import type { NodeWidth } from '@jbrowse/bandage-core/nodeWidths'

// The node thickness as a config or session writes it: a px number draws every
// node that thick; `{ field: 'depth', value }` thickens a node the more paths
// carry it, around `value` px. Unset is by depth around 6.
export type NodeSize = number | { field?: 'depth'; value?: number }

const DEFAULT_PX = 6

export function nodeSizeOf(size: unknown): { width: NodeWidth; px: number } {
  return typeof size === 'number'
    ? { width: 'uniform', px: size }
    : isRecord(size)
      ? {
          width: size.field === 'depth' ? 'depth' : 'uniform',
          px: typeof size.value === 'number' ? size.value : DEFAULT_PX,
        }
      : { width: 'depth', px: DEFAULT_PX }
}

export function sizeOfNodeWidth(width: NodeWidth, px: number): NodeSize {
  return width === 'depth' ? { field: 'depth', value: px } : px
}
