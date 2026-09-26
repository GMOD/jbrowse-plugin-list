import { Button, Typography } from '@mui/material'
import { observer } from 'mobx-react'

import type { GraphGenomeViewModel } from '../model'

const FollowControl = observer(function FollowControl({
  model,
}: {
  model: GraphGenomeViewModel
}) {
  const { followLinearView, followState } = model
  const note = followState.active ? model.followNote : undefined
  const state = !followLinearView
    ? 'Pinned'
    : followState.active
      ? (note ??
        `Following the linear view${model.cutTier === 'coarse' ? ', coarse tier' : ''}`)
      : followState.reason
  return model.loadedTrackId ? (
    <>
      <Button
        size="small"
        onClick={() => {
          model.setFollowLinearView(!followLinearView)
        }}
      >
        {followLinearView ? 'Pin' : 'Follow'}
      </Button>
      {state ? (
        <Typography
          variant="caption"
          color={note ? 'warning.main' : 'text.secondary'}
          data-testid="graph-follow-status"
        >
          {state}
        </Typography>
      ) : null}
    </>
  ) : null
})

export default FollowControl
