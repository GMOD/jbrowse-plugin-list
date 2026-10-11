import { isRecord } from '../isRecord'

import type { ColorScheme } from '@jbrowse/bandage-core/colorSchemes'

interface Span {
  start: number
  end: number
}

// The node color as a config or session writes it, in core's color-object
// members (ADR-131, ADR-151): a named constant, or the field the nodes are
// colored by. `{}` or unset picks by the graph, reference position on an
// anchored one. Translated here because Bandage's painter takes its own
// schemes, which BandageJS shares.
export type NodeColor =
  | 'grey'
  | 'uniform'
  | {
      field?: 'depth' | 'length' | 'rank' | 'position' | 'id'
      scale?: 'categorical'
      scheme?: 'rainbow'
      domainMin?: number
      domainMax?: number
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
  if (color === 'grey' || color === 'uniform') {
    return color
  }
  if (isRecord(color)) {
    const { field, scheme } = color
    if (field === 'id') {
      return scheme === 'rainbow' ? 'rainbow' : 'random'
    }
    if (typeof field === 'string' && field in SCHEME_OF_FIELD) {
      return SCHEME_OF_FIELD[field as keyof typeof SCHEME_OF_FIELD]
    }
  }
  return 'auto'
}

export function domainOfColor(color: unknown): Span | undefined {
  return isRecord(color) &&
    typeof color.domainMin === 'number' &&
    typeof color.domainMax === 'number'
    ? { start: color.domainMin, end: color.domainMax }
    : undefined
}

export function colorOfScheme(scheme: ColorScheme, domain?: Span): NodeColor {
  if (scheme === 'grey' || scheme === 'uniform') {
    return scheme
  }
  return scheme === 'random'
    ? { field: 'id', scale: 'categorical' }
    : scheme === 'rainbow'
      ? { field: 'id', scheme: 'rainbow' }
      : scheme === 'reference-position' && domain
        ? {
            field: 'position',
            domainMin: domain.start,
            domainMax: domain.end,
          }
        : FIELD_OF_SCHEME[scheme]
          ? { field: FIELD_OF_SCHEME[scheme] }
          : {}
}
