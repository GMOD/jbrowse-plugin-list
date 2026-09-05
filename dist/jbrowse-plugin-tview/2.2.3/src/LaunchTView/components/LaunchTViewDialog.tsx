import React, { useState } from 'react'

import { getConf } from '@jbrowse/core/configuration'
import { Dialog, ErrorMessage } from '@jbrowse/core/ui'
import {
  assembleLocString,
  getContainingView,
  getSession,
} from '@jbrowse/core/util'
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Typography,
} from '@mui/material'

import ArrayReport from './ArrayReport'
import { MAX_BP } from '../limits'
import { useTviewMsa } from '../useTviewMsa'

import type { TviewInit } from '../../TViewPanel/init'
import type { AbstractTrackModel } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// how much of the alignment the default column width aims to put on screen
const FIT_WIDTH_PX = 3000

function trackLabel(track: AbstractTrackModel) {
  return (
    (getConf(track, 'name') as string) || (getConf(track, 'trackId') as string)
  )
}

/** every alignments track open in the same view, the launching one first */
function peerTracks(view: LinearGenomeViewModel, model: AbstractTrackModel) {
  const alignments = view.tracks.filter(track =>
    track.displays.some(
      (display: { type: string }) => display.type === 'LinearAlignmentsDisplay',
    ),
  ) as AbstractTrackModel[]
  return [model, ...alignments.filter(t => t.id !== model.id)]
}

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

  const candidates = peerTracks(view, model)
  // the launching track is always in; the others are opt-in, because pulling
  // every open pileup into one alignment is a much bigger fetch than the menu
  // item that got here suggests
  const [extra, setExtra] = useState<string[]>([])
  const chosen = candidates.filter(
    t => t.id === model.id || extra.includes(t.id),
  )

  // The dialog's whole output. Everything below either previews what this
  // resolves to or hands it to a view, so what the button opens is the same
  // blob a session could have been authored with.
  const init: TviewInit | undefined = region
    ? {
        assembly: region.assemblyName,
        loc: assembleLocString(region),
        tracks: chosen.map(t => ({
          trackId: getConf(t, 'trackId') as string,
          sample: trackLabel(t),
        })),
      }
    : undefined

  const { data, error, isLoading } = useTviewMsa({
    session,
    init: tooWide ? undefined : init,
  })

  // 10 is comfortable for an ordinary pileup, but an unrolled tandem array runs
  // to hundreds of columns and at 10 almost none of it is on screen at once.
  // Fits the alignment to roughly two screen-widths; a no-op for the narrow
  // regions that already fitted.
  const totalColumns = data?.columnCount ?? 0
  const colWidth = totalColumns
    ? Math.max(1, Math.min(10, Math.floor(FIT_WIDTH_PX / totalColumns)))
    : 10

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
        <Typography>
          Create a view similar to "samtools tview" for the reads in the current
          region: {init?.loc ?? 'Unknown'}
        </Typography>
        {candidates.length > 1 ? (
          <div>
            <Typography variant="subtitle2">
              Include reads from other alignment tracks in this view
            </Typography>
            {candidates.slice(1).map(track => (
              <FormControlLabel
                key={track.id}
                control={
                  <Checkbox
                    checked={extra.includes(track.id)}
                    onChange={event => {
                      setExtra(
                        event.target.checked
                          ? [...extra, track.id]
                          : extra.filter(id => id !== track.id),
                      )
                    }}
                  />
                }
                label={trackLabel(track)}
              />
            ))}
          </div>
        ) : null}
        {tooWide ? (
          <Typography>
            Region is {width.toLocaleString('en-US')}bp, wider than the{' '}
            {MAX_BP.toLocaleString('en-US')}bp limit. Zoom in and try again.
          </Typography>
        ) : error ? (
          <ErrorMessage error={error} />
        ) : isLoading ? (
          <Typography>Loading...</Typography>
        ) : data?.tooLarge ? (
          <Typography>
            {data.rowCount.toLocaleString('en-US')} rows over{' '}
            {data.columnCount.toLocaleString('en-US')} columns is{' '}
            {data.cellCount.toLocaleString('en-US')} cells, which is too large
            to render. Zoom in and try again.
          </Typography>
        ) : data ? (
          <>
            <Typography>
              {data.rowCount} rows
              {data.referenceName
                ? ' (the reference plus every read with sequence)'
                : ' of reads with sequence data'}
              {data.samples.length > 1
                ? `, from ${data.samples.length} tracks`
                : ''}
            </Typography>
            <ArrayReport data={data} />
          </>
        ) : (
          <Typography>No region is currently visible.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          disabled={!data?.msa || !init}
          onClick={() => {
            if (init) {
              session.addView('TView', {
                type: 'TView',
                displayName: init.loc,
                init,
                colWidth,
                rowHeight: 12,
                labelsAlignRight: true,
                colorSchemeName: 'jbrowse_dna',
                drawTree: init.tracks.length > 1,
                connectedViewId: view.id,
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
