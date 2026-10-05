import { Typography, useTheme } from '@mui/material'
import { observer } from 'mobx-react'

import {
  BAR_PX,
  SECTION_HEADER_PX,
  axisTicks,
  copiesOf,
  facetSections,
  formatBp,
  readout,
  unitLabel,
} from '../layout'

import type { RepeatAllele, TandemRepeat } from '../../tandemRepeat'
import type { TandemRepeatViewModel } from '../model'

// Tableau 10, whose leading hues stay apart in lightness as well as hue
const UNIT_COLORS = [
  '#4e79a7',
  '#f28e2b',
  '#59a14f',
  '#e15759',
  '#76b7b2',
  '#edc948',
  '#b07aa1',
  '#ff9da7',
  '#9c755f',
  '#bab0ac',
]
const NO_RUNS = '#bdbdbd'
const AXIS_PX = 26
const PAD = 12
const CHAR_PX = 6.6
// copies narrower than this draw as one run, without separators
const MIN_COPY_PX = 3

function unitColor(unit: number) {
  return UNIT_COLORS[unit % UNIT_COLORS.length]!
}

const swatch = { width: 18, height: BAR_PX - 4, borderRadius: 2 }
const legendRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  fontSize: 12,
  whiteSpace: 'nowrap' as const,
}

function Legend({
  repeat,
  referenceBp,
}: {
  repeat: TandemRepeat
  referenceBp: number
}) {
  const theme = useTheme()
  const unstated = repeat.alleles.some(a => !a.runs)
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
      {repeat.units.map((unit, i) => (
        <div key={i} style={legendRow}>
          <div style={{ ...swatch, backgroundColor: unitColor(i) }} />
          <span>
            {unitLabel(repeat.units, i)} · {unit.length.toLocaleString()} bp
          </span>
        </div>
      ))}
      {unstated ? (
        <div style={legendRow}>
          <div style={{ ...swatch, backgroundColor: NO_RUNS }} />
          <span>
            runs not stated
            {repeat.unitLength
              ? `, ticked every ${repeat.unitLength.toLocaleString()} bp`
              : ''}
          </span>
        </div>
      ) : null}
      <div style={legendRow}>
        <svg width={18} height={BAR_PX}>
          <line
            x1={9}
            x2={9}
            y1={0}
            y2={BAR_PX}
            stroke={theme.palette.text.secondary}
            strokeDasharray="3 2"
          />
        </svg>
        <span>reference allele · {formatBp(referenceBp)}</span>
      </div>
    </div>
  )
}

function Row({
  allele,
  repeat,
  y,
  barPx,
  labelled,
  X,
  scale,
  labelRight,
  text,
  gap,
  referenceBp,
}: {
  allele: RepeatAllele
  repeat: TandemRepeat
  y: number
  barPx: number
  labelled: boolean
  X: (bp: number) => number
  scale: number
  labelRight: number
  text: string
  gap: string
  referenceBp: number
}) {
  const top = y - barPx / 2
  const copies = copiesOf(allele, repeat.units)
  const unit = repeat.unitLength
  const ticked =
    !allele.runs && unit !== undefined && unit * scale >= MIN_COPY_PX
  return (
    <g data-testid="tandem-repeat-row">
      {labelled ? (
        <text
          x={labelRight}
          y={y + 4}
          fontSize={11}
          textAnchor="end"
          fill={text}
        >
          {allele.label}
        </text>
      ) : null}
      {allele.runs ? (
        copies.map((copy, i) => {
          const px = copy.bp * scale
          return (
            <rect
              key={i}
              x={X(copy.start)}
              y={top}
              width={Math.max(1, px >= MIN_COPY_PX ? px - 1 : px)}
              height={barPx}
              fill={unitColor(copy.unit)}
            >
              <title>
                {`${allele.label}: copy ${i + 1} of ${copies.length}, ${unitLabel(repeat.units, copy.unit)}, ${copy.bp.toLocaleString()} bp`}
              </title>
            </rect>
          )
        })
      ) : (
        <rect
          x={X(0)}
          y={top}
          width={Math.max(1, allele.bp * scale)}
          height={barPx}
          fill={NO_RUNS}
        >
          <title>{`${allele.label}: ${allele.bp.toLocaleString()} bp`}</title>
        </rect>
      )}
      {ticked
        ? Array.from({ length: Math.ceil(allele.bp / unit) - 1 }, (_, i) =>
            X((i + 1) * unit),
          ).map(x => (
            <line
              key={x}
              x1={x}
              x2={x}
              y1={top}
              y2={top + barPx}
              stroke={gap}
            />
          ))
        : null}
      {labelled ? (
        <text x={X(allele.bp) + 6} y={y + 4} fontSize={11} fill={text}>
          {readout(allele, referenceBp, unit)}
        </text>
      ) : null}
    </g>
  )
}

function EmptyState() {
  return (
    <Typography variant="body2" style={{ padding: PAD }}>
      Right-click a VCF 4.5 &lt;CNV:TR&gt; record in a variant track and choose{' '}
      <b>Show repeat copies</b>.
    </Typography>
  )
}

const TandemRepeatView = observer(function TandemRepeatView({
  model,
}: {
  model: TandemRepeatViewModel
}) {
  const theme = useTheme()
  const { repeat, width } = model
  if (!repeat) {
    return <EmptyState />
  }
  const { alleles, refName, start, end } = repeat
  const referenceBp = end - start
  const { rowPx, barPx, labelled, rule, sections, rowsPx } = facetSections(
    alleles,
    repeat.units,
    model.samples,
    model.facet,
  )
  const readouts = alleles.map(a => readout(a, referenceBp, repeat.unitLength))
  const labelPx = labelled
    ? Math.max(...alleles.map(a => a.label.length)) * CHAR_PX + PAD
    : 0
  const readoutPx = labelled
    ? Math.max(...readouts.map(r => r.length)) * CHAR_PX + PAD
    : 0
  const plotPx = Math.max(100, width - labelPx - readoutPx - 2 * PAD)
  const maxBp = Math.max(referenceBp, ...alleles.map(a => a.bp))
  const scale = plotPx / maxBp
  const left = PAD + labelPx
  const X = (bp: number) => left + bp * scale
  const height = AXIS_PX + rowsPx + PAD
  const text = theme.palette.text.primary
  const faint = theme.palette.text.secondary
  const gap = theme.palette.background.paper
  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 8,
          padding: `${PAD / 2}px ${PAD}px`,
        }}
      >
        <Typography variant="body2">
          <b>{repeat.name}</b> · {refName}:{(start + 1).toLocaleString()}-
          {end.toLocaleString()} · {alleles.length} alleles, each on its own bp
          axis
          {rule ? `, ${rule}` : null}
          {labelled ? null : ', too many to label: hover a copy for its row'}
        </Typography>
        <Legend repeat={repeat} referenceBp={referenceBp} />
      </div>
      <svg
        width={width}
        height={height}
        style={{ display: 'block' }}
        data-testid="tandem-repeat-view"
      >
        {axisTicks(maxBp).map(bp => (
          <g key={bp}>
            <line
              x1={X(bp)}
              x2={X(bp)}
              y1={AXIS_PX - 8}
              y2={AXIS_PX - 3}
              stroke={faint}
            />
            <text
              x={X(bp)}
              y={AXIS_PX - 12}
              fontSize={10}
              textAnchor="middle"
              fill={faint}
            >
              {bp === 0 ? '0' : formatBp(bp)}
            </text>
          </g>
        ))}
        <line
          x1={X(referenceBp)}
          x2={X(referenceBp)}
          y1={AXIS_PX - 3}
          y2={height - PAD / 2}
          stroke={faint}
          strokeDasharray="3 2"
        />
        {sections.map(section => {
          const headerPx = section.title ? SECTION_HEADER_PX : 0
          const top = AXIS_PX + section.top + headerPx
          return (
            <g key={section.key}>
              {section.title ? (
                <text
                  x={PAD}
                  y={top - 4}
                  fontSize={11}
                  fontWeight="bold"
                  fill={text}
                  data-testid="tandem-repeat-section"
                >
                  {section.title}
                </text>
              ) : null}
              {section.rows.map((allele, i) => (
                <Row
                  key={`${allele.label}-${i}`}
                  allele={allele}
                  repeat={repeat}
                  y={top + i * rowPx + rowPx / 2}
                  barPx={barPx}
                  labelled={labelled}
                  X={X}
                  scale={scale}
                  labelRight={left - 8}
                  text={text}
                  gap={gap}
                  referenceBp={referenceBp}
                />
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
})

export default TandemRepeatView
