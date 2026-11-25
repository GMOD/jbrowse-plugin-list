import { MAX_MODIFICATION_CALLS } from '../LaunchTView/modifications'

import type { TviewModifications } from '../LaunchTView/modifications'
import type { MenuItem } from '@jbrowse/core/ui'
import type { AlignmentMarkSpec, Annotation, ResidueColor } from 'react-msaview'

/** the SAMtags codes, and the ChEBI ids JBrowse names */
const NAMES: Record<string, string> = {
  m: '5mC',
  h: '5hmC',
  f: '5fC',
  c: '5caC',
  g: '5hmU',
  e: '5fU',
  b: '5caU',
  a: '6mA',
  o: '8oxoG',
  n: 'xao',
  17082: 'pseU',
  17596: 'inosine',
  21839: '4mC',
}

/** the calls a load placed, and the ones it could not show */
export interface ModificationSummary {
  shown: number
  dropped: number
  unplaced: number
}

export const MODIFICATION_MARK: AlignmentMarkSpec = {
  kind: 'features',
  height: { band: 1 },
  encoding: {
    fill: {
      field: 'probability',
      scale: {
        type: 'linear',
        domainMin: 0,
        domainMax: 100,
        range: ['#0000ff', '#ff0000'],
      },
      legend: { title: 'modification %' },
    },
  },
}

export function modificationName(type: string) {
  return NAMES[type] ?? type
}

export function modificationAnnotations({
  rows,
  types,
  row,
  residue,
  type,
  prob,
}: TviewModifications): Annotation[] {
  return Array.from(row, (r, i) => {
    const name = modificationName(types[type[i]!]!)
    const percent = Math.round(((prob[i]! + 0.5) / 256) * 100)
    return {
      id: rows[r]!,
      accession: name,
      name,
      description: `${name} ${percent}%`,
      featureType: 'modified_base',
      start: residue[i]!,
      end: residue[i]!,
      attributes: { probability: String(percent) },
    }
  })
}

const n = (x: number) => x.toLocaleString('en-US')

export function modificationSummaryLine({
  shown,
  dropped,
  unplaced,
}: ModificationSummary) {
  return [
    `${n(shown)} calls shown`,
    ...(dropped
      ? [
          `${n(dropped)} less probable over the ${n(MAX_MODIFICATION_CALLS)} cap`,
        ]
      : []),
    ...(unplaced
      ? [`${n(unplaced)} ${unplaced === 1 ? 'row' : 'rows'} not annotated`]
      : []),
  ].join(', ')
}

interface ColoredView {
  residueColor: ResidueColor
  resolvedResidueColor: { field: string }
  setResidueColor: (color: ResidueColor) => void
}

export function modificationMenu(
  summary: ModificationSummary,
  view: ColoredView,
) {
  const alone = view.resolvedResidueColor.field === 'feature'
  const colorBy = (field: 'residue' | 'feature') => () => {
    view.setResidueColor({ ...view.residueColor, field })
  }
  const summaryLine: MenuItem[] =
    summary.dropped || summary.unplaced
      ? [{ type: 'subHeader', label: modificationSummaryLine(summary) }]
      : []
  return {
    label: 'Base modifications',
    subMenu: [
      {
        label: 'Over base colors',
        type: 'radio',
        checked: !alone,
        onClick: colorBy('residue'),
      },
      {
        label: 'Without base colors',
        type: 'radio',
        checked: alone,
        onClick: colorBy('feature'),
      },
      ...summaryLine,
    ],
  } satisfies MenuItem
}
