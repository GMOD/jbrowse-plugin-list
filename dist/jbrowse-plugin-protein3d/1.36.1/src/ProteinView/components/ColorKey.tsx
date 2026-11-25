import React from 'react'

import Typography from '@mui/material/Typography'
import { observer } from 'mobx-react'

import type { Legend } from 'molstar/lib/mol-util/legend'

export interface ColorKeyEntry {
  label: string
  color: string
}

const swatch = {
  width: 8,
  height: 8,
  border: '1px solid rgba(0,0,0,0.3)',
}

// 'inherit' for a key shown in a tooltip, whose text is light on dark
type KeyColor = 'textSecondary' | 'inherit'

const KeyRow = observer(function KeyRow({
  title,
  testId,
  color,
  children,
}: {
  title: string
  testId: string
  color: KeyColor
  children: React.ReactNode
}) {
  return (
    <Typography
      variant="caption"
      color={color}
      component="div"
      data-testid={testId}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        fontSize: 9,
        paddingLeft: 8,
      }}
    >
      <span>{title}:</span>
      {children}
    </Typography>
  )
})

const KeyEntry = observer(function KeyEntry({ label, color }: ColorKeyEntry) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <span style={{ ...swatch, background: color }} />
      {label}
    </span>
  )
})

export const ColorKey = observer(function ColorKey({
  title,
  entries,
  testId = 'track-legend',
  color = 'textSecondary',
}: {
  title: string
  entries: ColorKeyEntry[]
  testId?: string
  color?: KeyColor
}) {
  return (
    <KeyRow title={title} testId={testId} color={color}>
      {entries.map((entry, i) => (
        <KeyEntry key={`${i}-${entry.label}`} {...entry} />
      ))}
    </KeyRow>
  )
})

export const GradientKey = observer(function GradientKey({
  title,
  minLabel,
  maxLabel,
  colors,
  noValue,
  testId = 'track-legend',
  color = 'textSecondary',
}: {
  title: string
  minLabel: string
  maxLabel: string
  colors: string[]
  noValue?: ColorKeyEntry
  testId?: string
  color?: KeyColor
}) {
  return (
    <KeyRow title={title} testId={testId} color={color}>
      {minLabel}
      <span
        style={{
          ...swatch,
          width: 60,
          background: `linear-gradient(to right, ${colors.join(', ')})`,
        }}
      />
      {maxLabel}
      {noValue ? <KeyEntry {...noValue} /> : null}
    </KeyRow>
  )
})

// Mol*'s Color is a 0xRRGGBB number; formatted here so the header does not
// pull Mol* into the bundle every host evaluates on boot.
function cssColor(color: number) {
  return `#${color.toString(16).padStart(6, '0')}`
}

// Mol* names secondary structure in camelCase (alphaHelix); chain ids and
// residue names are case-sensitive and stay as given
export function words(name: string) {
  return name.replaceAll(
    /([a-z])([A-Z])(?=[a-z])/g,
    (_, a: string, b: string) => `${a} ${b.toLowerCase()}`,
  )
}

export const MolstarLegendKey = observer(function MolstarLegendKey({
  title,
  legend,
  noValue,
}: {
  title: string
  legend: Legend
  noValue?: ColorKeyEntry
}) {
  return legend.kind === 'table-legend' ? (
    <ColorKey
      title={title}
      testId="structure-legend"
      entries={legend.table.map(([name, color]) => ({
        label: words(name),
        color: cssColor(color),
      }))}
    />
  ) : (
    <GradientKey
      title={title}
      testId="structure-legend"
      minLabel={legend.minLabel}
      maxLabel={legend.maxLabel}
      noValue={noValue}
      colors={legend.colors.map(entry =>
        Array.isArray(entry)
          ? `${cssColor(entry[0])} ${100 * entry[1]}%`
          : cssColor(entry),
      )}
    />
  )
})
