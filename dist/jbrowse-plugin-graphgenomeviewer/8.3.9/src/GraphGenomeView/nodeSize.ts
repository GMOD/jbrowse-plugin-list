import { isRecord } from '../isRecord'

import type { EdgeWidth } from '@jbrowse/bandage-core/edgeWidths'
import type { NodeWidth } from '@jbrowse/bandage-core/nodeWidths'

// The mark thickness as a config or session writes it: a px number draws every
// node that thick; `{ field: 'depth', value }` thickens a node the more paths
// carry it, around `value` px; `{ field: 'frequency', value }` draws it as wide
// as the share of haplotypes through it, `value` px at 100%; `links: 'walks'`
// thickens a link the more walks take it. Unset is nodes by depth around 6,
// links uniform.
export type NodeSize =
  number | { field?: 'depth' | 'frequency'; value?: number; links?: 'walks' }

const DEFAULT_PX = 6

export interface MarkSize {
  width: NodeWidth
  px: number
  links: EdgeWidth
}

export function nodeSizeOf(size: unknown): MarkSize {
  return typeof size === 'number'
    ? { width: 'uniform', px: size, links: 'uniform' }
    : isRecord(size)
      ? {
          width:
            size.field === 'depth' || size.field === 'frequency'
              ? size.field
              : 'uniform',
          px: typeof size.value === 'number' ? size.value : DEFAULT_PX,
          links: size.links === 'walks' ? 'walks' : 'uniform',
        }
      : { width: 'depth', px: DEFAULT_PX, links: 'uniform' }
}

export function sizeOf({ width, px, links }: MarkSize): NodeSize {
  return width === 'uniform' && links === 'uniform'
    ? px
    : {
        ...(width === 'uniform' ? {} : { field: width }),
        value: px,
        ...(links === 'walks' ? { links } : {}),
      }
}
