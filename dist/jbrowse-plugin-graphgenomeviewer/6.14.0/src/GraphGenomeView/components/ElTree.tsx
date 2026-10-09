import { createElement } from 'react'
import type { ReactNode } from 'react'

import type { El } from '@jbrowse/bandage-core/el'

// SVG's attribute names as React's props: `class` is className, `data-` and
// `aria-` keep their dashes, the rest are camel-cased (`stroke-width` is
// strokeWidth)
function propName(name: string) {
  return name === 'class'
    ? 'className'
    : /^(data|aria)-/.test(name)
      ? name
      : name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

function toReact(node: El | string, key: number): ReactNode {
  if (typeof node === 'string') {
    return node
  }
  const props: Record<string, unknown> = { key }
  for (const [name, value] of Object.entries(node.attrs)) {
    if (value !== undefined) {
      props[propName(name)] = value
    }
  }
  return createElement(node.tag, props, ...node.children.map(toReact))
}

// A core element tree as React elements
export default function ElTree({ el }: { el: El }) {
  return toReact(el, 0)
}
