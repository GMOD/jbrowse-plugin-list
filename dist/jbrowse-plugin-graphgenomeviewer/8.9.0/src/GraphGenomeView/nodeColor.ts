import { isRecord } from '../isRecord'

import type { ColorScheme } from '@jbrowse/bandage-core/colorSchemes'

interface Span {
  start: number
  end: number
}

// The node color as a config or session writes it, in core's channel object
// (ADR-240): a `value` naming a constant scheme, or the `field` the nodes are
// colored by with the `scale` it maps through. `{}` or unset picks by the
// graph, reference position on an anchored one. Not display-kit's
// `colorConfigSchema`: its `value` is a CSS color and its `field` a feature
// attribute, where Bandage's painter takes its own schemes, which BandageJS
// shares.
export interface NodeColor {
  value?: 'grey' | 'uniform'
  field?: 'depth' | 'length' | 'rank' | 'position' | 'id'
  scale?: {
    type?: 'ordinal'
    scheme?: 'rainbow'
    domainMin?: number
    domainMax?: number
  }
}

// What the node color sits in on a display's config: core's `encoding`
export interface GraphEncoding {
  color?: NodeColor
}

const SCHEME_OF_FIELD = {
  depth: 'depth',
  length: 'node-length',
  rank: 'stable-rank',
  position: 'reference-position',
} as const

const FIELD_OF_SCHEME = Object.fromEntries(
  Object.entries(SCHEME_OF_FIELD).map(([field, scheme]) => [scheme, field]),
) as Record<string, keyof typeof SCHEME_OF_FIELD>

export function schemeOfColor(color: unknown): ColorScheme {
  if (isRecord(color)) {
    const { field, value, scale } = color
    if (value === 'grey' || value === 'uniform') {
      return value
    }
    if (field === 'id') {
      return isRecord(scale) && scale.scheme === 'rainbow'
        ? 'rainbow'
        : 'random'
    }
    if (typeof field === 'string' && field in SCHEME_OF_FIELD) {
      return SCHEME_OF_FIELD[field as keyof typeof SCHEME_OF_FIELD]
    }
  }
  return 'auto'
}

export function domainOfColor(color: unknown): Span | undefined {
  const scale = isRecord(color) ? color.scale : undefined
  return isRecord(scale) &&
    typeof scale.domainMin === 'number' &&
    typeof scale.domainMax === 'number'
    ? { start: scale.domainMin, end: scale.domainMax }
    : undefined
}

export function colorOfScheme(scheme: ColorScheme, domain?: Span): NodeColor {
  if (scheme === 'grey' || scheme === 'uniform') {
    return { value: scheme }
  }
  return scheme === 'random'
    ? { field: 'id', scale: { type: 'ordinal' } }
    : scheme === 'rainbow'
      ? { field: 'id', scale: { scheme: 'rainbow' } }
      : scheme === 'reference-position' && domain
        ? {
            field: 'position',
            scale: { domainMin: domain.start, domainMax: domain.end },
          }
        : FIELD_OF_SCHEME[scheme]
          ? { field: FIELD_OF_SCHEME[scheme] }
          : {}
}
