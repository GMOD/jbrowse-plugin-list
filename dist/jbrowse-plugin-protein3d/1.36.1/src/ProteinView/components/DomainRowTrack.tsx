import React from 'react'

import { observer } from 'mobx-react'

import RangeBar, { RangeBarTrack, rangeText } from './RangeBar'

import type { DomainBar as DomainBarRun, DomainRow } from '../alignmentDomains'
import type { JBrowsePluginProteinStructureModel } from '../model'

const KIND_LABEL = { domain: 'Domain', site: 'Site' }

const DomainBar = observer(function DomainBar({
  row,
  bar,
  selected,
  tabStop,
  model,
}: {
  row: DomainRow
  bar: DomainBarRun
  selected: boolean
  tabStop: boolean
  model: JBrowsePluginProteinStructureModel
}) {
  const residues = rangeText(
    model.residueNumber(bar.structureStart),
    model.residueNumber(bar.structureEnd - 1),
  )
  return (
    <RangeBar
      alignmentStart={bar.alignmentStart}
      alignmentEnd={bar.alignmentEnd}
      top={0}
      height={`calc(100% - ${model.trackGap}px)`}
      color={row.color}
      selected={selected}
      tabStop={tabStop}
      tooltip={
        <div>
          <div>
            <strong>{row.label}</strong>
          </div>
          <div>
            {KIND_LABEL[row.kind]} from the alignment, {row.accession}
          </div>
          <div>Structure residue: {residues}</div>
        </div>
      }
      ariaLabel={`${row.label} ${residues}`}
      dataAttributes={{
        'data-testid': `alignment-domain-${row.kind}`,
        'data-accession': row.accession,
      }}
      onClick={() => {
        model.toggleDomainRow(row)
      }}
      model={model}
    />
  )
})

/** One overview row from the alignment: a bar per run of its residues */
const DomainRowTrack = observer(function DomainRowTrack({
  row,
  model,
}: {
  row: DomainRow
  model: JBrowsePluginProteinStructureModel
}) {
  const selected = model.selectedFeatureId === `alignment:${row.accession}`
  const first = Math.min(...row.bars.map(bar => bar.alignmentStart))
  return (
    <RangeBarTrack>
      {row.bars.map(bar => (
        <DomainBar
          key={bar.alignmentStart}
          row={row}
          bar={bar}
          selected={selected}
          tabStop={bar.alignmentStart === first}
          model={model}
        />
      ))}
    </RangeBarTrack>
  )
})

export default DomainRowTrack
