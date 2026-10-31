import React, { useState } from 'react'

import { readConfObject } from '@jbrowse/core/configuration'
import { getSession, getTrackName } from '@jbrowse/core/util'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'

import { trackConfigNode } from '../../trackConfigNode'
import { TRACK_STATS } from '../proteinColor'
import { parseCuts, thresholdRange } from '../thresholdPalette'

import type { JBrowsePluginProteinViewModel } from '../model'
import type { TrackStat } from '../proteinColor'

const STAT_LABELS: Record<TrackStat, string> = {
  mean: 'Mean of the three bases',
  max: 'Highest of the three bases',
  min: 'Lowest of the three bases',
}

const GenomeTrackColorDialog = observer(function GenomeTrackColorDialog({
  model,
  handleClose,
}: {
  model: JBrowsePluginProteinViewModel
  handleClose: () => void
}) {
  const session = getSession(model)
  const assemblyName = model.structures.find(s => s.connectedView)
    ?.connectedView?.assemblyNames[0]
  const assembly = assemblyName
    ? session.assemblyManager.get(assemblyName)
    : undefined
  const assemblyNames = new Set([
    ...(assemblyName ? [assemblyName] : []),
    ...(assembly ? [assembly.name, ...assembly.aliases] : []),
  ])
  const tracks = session.tracks
    .filter(entry => entry.type === 'QuantitativeTrack')
    .filter(entry => {
      const conf = trackConfigNode(session, entry)
      return (
        conf !== undefined &&
        (assemblyNames.size === 0 ||
          readConfObject(conf, 'assemblyNames').some((n: string) =>
            assemblyNames.has(n),
          ))
      )
    })
    .map(entry => ({
      trackId: entry.trackId,
      name: getTrackName(entry, session),
    }))
    .toSorted((a, b) => a.name.localeCompare(b.name))
  const { color } = model
  const [trackId, setTrackId] = useState(
    color.field === 'track' ? (color.trackId ?? '') : '',
  )
  const [stat, setStat] = useState<TrackStat>(
    color.field === 'track' ? (color.stat ?? 'mean') : 'mean',
  )
  const [scale, setScale] = useState<'linear' | 'threshold'>(
    color.field === 'track' && color.scale === 'threshold'
      ? 'threshold'
      : 'linear',
  )
  const [cutsText, setCutsText] = useState(
    color.field === 'track' && color.domain ? color.domain.join(', ') : '',
  )
  const cuts = parseCuts(cutsText)
  const cutsInvalid = scale === 'threshold' && !cuts
  return (
    <Dialog open onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Color by a genome track</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Each residue takes the track&apos;s scores under its codon on the
          genome view&apos;s assembly
          {assemblyName ? ` (${assemblyName})` : ''}. Residues with no score are
          grey.
        </Typography>
        <TextField
          select
          fullWidth
          label="Track"
          value={trackId}
          onChange={e => {
            setTrackId(e.target.value)
          }}
          helperText={
            tracks.length === 0
              ? 'This session has no bigWig or bedGraph track on the genome view’s assembly'
              : undefined
          }
          sx={{ mb: 2 }}
        >
          {tracks.map(t => (
            <MenuItem key={t.trackId} value={t.trackId}>
              {t.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          label="Score per residue"
          value={stat}
          onChange={e => {
            setStat(e.target.value as TrackStat)
          }}
        >
          {TRACK_STATS.map(s => (
            <MenuItem key={s} value={s}>
              {STAT_LABELS[s]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          label="Scale"
          value={scale}
          onChange={e => {
            setScale(e.target.value as 'linear' | 'threshold')
          }}
          sx={{ mt: 2 }}
        >
          <MenuItem value="linear">Continuous, light to dark</MenuItem>
          <MenuItem value="threshold">Thresholds</MenuItem>
        </TextField>
        {scale === 'threshold' ? (
          <TextField
            fullWidth
            label="Cuts, lowest first"
            placeholder="-1.328, -0.748"
            value={cutsText}
            error={cutsInvalid}
            helperText={
              cutsInvalid
                ? 'Numbers, each above the last'
                : 'Red below the first cut, blue above the last'
            }
            onChange={e => {
              setCutsText(e.target.value)
            }}
            sx={{ mt: 2 }}
          />
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!trackId || cutsInvalid}
          onClick={() => {
            // the same track on the same scale keeps what a session wrote
            // beside it: its palette, labels, title and domain
            const kept =
              color.field === 'track' &&
              color.trackId === trackId &&
              (color.scale === 'threshold') === (scale === 'threshold')
                ? color
                : undefined
            const sameBands = kept?.range?.length === (cuts?.length ?? 0) + 1
            model.setColor(
              scale === 'threshold' && cuts
                ? {
                    ...kept,
                    field: 'track',
                    trackId,
                    stat,
                    scale,
                    domain: cuts,
                    range: sameBands
                      ? kept.range
                      : thresholdRange(cuts.length + 1),
                    labels: sameBands ? kept.labels : undefined,
                  }
                : { ...kept, field: 'track', trackId, stat },
            )
            handleClose()
          }}
        >
          Color
        </Button>
      </DialogActions>
    </Dialog>
  )
})

export default GenomeTrackColorDialog
