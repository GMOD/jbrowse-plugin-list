import React from 'react'

import { getConf } from '@jbrowse/core/configuration'
import { Dialog, ErrorMessage } from '@jbrowse/core/ui'
import {
  assembleLocString,
  getContainingView,
  getSession,
} from '@jbrowse/core/util'
import { Button, DialogActions, DialogContent } from '@mui/material'

import { MAX_BP, MAX_CELLS } from '../limits'
import { renderTviewMsa } from '../tview'
import { useTviewMsa } from '../useTviewMsa'

import type { AbstractTrackModel } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export default function LaunchTViewDialog({
  handleClose,
  model,
}: {
  handleClose: () => void
  model: AbstractTrackModel
}) {
  const view = getContainingView(model) as LinearGenomeViewModel
  const session = getSession(model)
  const block = view.dynamicBlocks.contentBlocks[0]
  // assemblyName is required: the RPC uses it to map the view's refName onto
  // whatever the file calls that sequence (refNameAliases)
  const region = block
    ? {
        assemblyName: block.assemblyName,
        refName: block.refName,
        start: Math.floor(block.start),
        end: Math.ceil(block.end),
      }
    : undefined
  const width = region ? region.end - region.start : 0
  const tooWide = width > MAX_BP

  const { data, error, isLoading } = useTviewMsa({
    model,
    region: tooWide ? undefined : region,
  })
  const displayName = region ? assembleLocString(region) : 'Unknown'
  const tooLarge = !!data && data.plan.cellCount > MAX_CELLS
  // lets the view rebuild itself after a session reload
  const msaSource = region
    ? { trackId: getConf(model, 'trackId'), assemblyName: region.assemblyName }
    : undefined

  return (
    <Dialog
      maxWidth="xl"
      title="Launch tview"
      onClose={() => {
        handleClose()
      }}
      open
    >
      <DialogContent>
        <div>
          Create a view similar to "samtools tview" for the reads in the current
          region: {displayName}
        </div>
        {tooWide ? (
          <div>
            Region is {width.toLocaleString('en-US')}bp, wider than the{' '}
            {MAX_BP.toLocaleString('en-US')}bp limit. Zoom in and try again.
          </div>
        ) : error ? (
          <ErrorMessage error={error} />
        ) : isLoading ? (
          <div>Loading...</div>
        ) : tooLarge ? (
          <div>
            {data.rowCount.toLocaleString('en-US')} reads over{' '}
            {data.plan.layout.totalColumns.toLocaleString('en-US')} columns is{' '}
            {data.plan.cellCount.toLocaleString('en-US')} cells, above the{' '}
            {MAX_CELLS.toLocaleString('en-US')} limit. Zoom in and try again.
          </div>
        ) : data ? (
          <div>{data.rowCount} reads with sequence data found</div>
        ) : (
          <div>No region is currently visible.</div>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          disabled={!data?.rowCount || tooLarge}
          onClick={() => {
            if (data && !tooLarge) {
              session.addView('TView', {
                type: 'TView',
                displayName,
                colWidth: 10,
                rowHeight: 12,
                labelsAlignRight: true,
                colorSchemeName: 'jbrowse_dna',
                connectedViewId: view.id,
                msaRegion: data.plan.region,
                insertionWidths: data.plan.insertionWidths,
                msaSource,
                data: {
                  msa: renderTviewMsa(data.plan),
                },
              })
            }
            handleClose()
          }}
        >
          Submit
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            handleClose()
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
