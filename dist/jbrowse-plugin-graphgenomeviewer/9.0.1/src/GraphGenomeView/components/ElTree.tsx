import { createElement, useId } from 'react'
import type { ReactNode } from 'react'

import { PaneTransformGroup } from './PaneLayer'

import type { GraphPaneModel } from '../model'
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

function propsOf(node: El, key: number) {
  const props: Record<string, unknown> = { key }
  for (const [name, value] of Object.entries(node.attrs)) {
    if (value !== undefined) {
      props[propName(name)] = value
    }
  }
  return props
}

// A core tree's transform from layout units onto the screen, which ElTree
// draws as `pane`'s PaneTransformGroup
export const PANE_TRANSFORM = 'pane'

function toReact(
  node: El | string,
  key: number,
  pane: GraphPaneModel | undefined,
): ReactNode {
  return typeof node === 'string' ? (
    node
  ) : pane && node.attrs.transform === PANE_TRANSFORM ? (
    <PaneTransformGroup key={key} model={pane}>
      {node.children.map((child, k) => toReact(child, k, pane))}
    </PaneTransformGroup>
  ) : (
    createElement(
      node.tag,
      propsOf(node, key),
      node.children.map((child, k) => toReact(child, k, pane)),
    )
  )
}

// A useId fit for an SVG id and for url(#…)
export function useSvgId() {
  return useId().replaceAll(/[^\w-]/g, '')
}

// A core element tree as React elements
export default function ElTree({
  el,
  pane,
}: {
  el: El
  pane?: GraphPaneModel
}) {
  return toReact(el, 0, pane)
}
