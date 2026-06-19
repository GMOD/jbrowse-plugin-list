import React from 'react'
import { observer } from 'mobx-react'
import { getEnv } from 'mobx-state-tree'
import { IconButton, FormGroup, useTheme, alpha } from '@mui/material'
import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter'
import AlignHorizontalCenterIcon from '@mui/icons-material/AlignHorizontalCenter'
import { getSession } from '@jbrowse/core/util'

import { MultilevelLinearViewModel } from '../model'
import { PanControls } from './Controls'
import { RegionWidth } from './util'

type MLLV = MultilevelLinearViewModel

const LinkViews = observer(({ model }: { model: MLLV }) => {
  return (
    <IconButton
      onClick={model.toggleLinkViews}
      title="Toggle linked scrolls and behavior across views"
      data-testid="link_views"
    >
      {model.linkViews ? (
        <LinkOffIcon color="secondary" />
      ) : (
        <LinkIcon color="secondary" />
      )}
    </IconButton>
  )
})

const AlignViews = observer(({ model }: { model: MLLV }) => {
  return (
    <IconButton
      onClick={model.alignViews}
      title="Align views (realign sub views to the anchor view)"
      data-testid="align_views"
    >
      <AlignHorizontalCenterIcon color="secondary" />
    </IconButton>
  )
})

const ResetZooms = observer(({ model }: { model: MLLV }) => {
  return (
    <IconButton
      onClick={model.resetZooms}
      title="Reset sub view zoom levels within one stage of the anchor view"
      data-testid="zoom_views"
    >
      <FormatAlignCenterIcon color="secondary" />
    </IconButton>
  )
})

const Header = observer(
  ({
    model,
    ExtraButtons,
  }: {
    model: MLLV
    ExtraButtons?: React.ReactNode
  }) => {
    const theme = useTheme()
    const { primary } = theme.palette
    const colour = primary.light
    // @ts-ignore
    const anchorView = model?.views?.find((view) => view.isAnchor)

    const pluginManager = getEnv(getSession(model)).pluginManager

    const LGV = pluginManager.getPlugin(
      'LinearGenomeViewPlugin',
    ) as import('@jbrowse/plugin-linear-genome-view').default

    // @ts-ignore
    const { ZoomControls, SearchBox } = LGV.exports

    return (
      <div>
        {model?.initialized && anchorView?.initialized ? (
          <div
            style={{
              gridArea: '1/1/auto/span 2',
              display: 'flex',
              alignItems: 'center',
              height: 48,
              background: alpha(colour, 0.3),
            }}
          >
            <LinkViews model={model} />
            <AlignViews model={model} />
            <ResetZooms model={model} />
            <div style={{ flexGrow: 1 }} />
            <FormGroup row style={{ flexWrap: 'nowrap', marginRight: 7 }}>
              {/* @ts-ignore */}
              <PanControls model={anchorView} />
              <SearchBox model={anchorView} />
            </FormGroup>
            {/* @ts-ignore */}
            <RegionWidth model={anchorView} />
            <ZoomControls model={anchorView} />
            <div style={{ flexGrow: 1 }} />
          </div>
        ) : null}
      </div>
    )
  },
)

export default Header
