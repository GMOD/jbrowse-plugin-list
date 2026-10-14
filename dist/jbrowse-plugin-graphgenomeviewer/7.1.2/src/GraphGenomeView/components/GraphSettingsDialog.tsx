import type { ReactNode } from 'react'

import { BUBBLE_SPREADS } from '@jbrowse/bandage-core/bubbleSpreads'
import { LAYOUT_ENGINES } from '@jbrowse/bandage-core/layoutEngines'
import { LAYOUT_QUALITIES } from '@jbrowse/bandage-core/layoutQualities'
import { NODE_WIDTHS } from '@jbrowse/bandage-core/nodeWidths'
import { MAX_PATH_COLORS } from '@jbrowse/bandage-core/pathColors'
import { Dialog } from '@jbrowse/core/ui'
import {
  Button,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import LabelledSelect from './LabelledSelect'

import type { GraphPaneModel } from '../model'

const useStyles = makeStyles()({
  section: {
    marginBottom: 24,
  },
  group: {
    marginBottom: 16,
  },
  heading: {
    marginBottom: 8,
  },
})

function Caption({
  warn = false,
  children,
}: {
  warn?: boolean
  children: ReactNode
}) {
  return (
    <Typography
      variant="caption"
      component="div"
      color={warn ? 'warning.main' : 'text.secondary'}
    >
      {children}
    </Typography>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  const { classes } = useStyles()
  return (
    <section className={classes.group}>
      <Typography variant="subtitle1" className={classes.heading}>
        {title}
      </Typography>
      {children}
    </section>
  )
}

function SettingSwitch({
  label,
  checked,
  onChange,
  children,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  children?: ReactNode
}) {
  const { classes } = useStyles()
  return (
    <div className={classes.section}>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={e => {
              onChange(e.target.checked)
            }}
          />
        }
        label={label}
      />
      {children}
    </div>
  )
}

// one dropdown setting, at the dialog's width, and its caption
function SettingSelect<T extends string>({
  children,
  ...props
}: Omit<Parameters<typeof LabelledSelect<T>>[0], 'size' | 'sx'> & {
  children?: ReactNode
}) {
  const { classes } = useStyles()
  return (
    <div className={classes.section}>
      <LabelledSelect sx={{ minWidth: 200 }} {...props} />
      {children}
    </div>
  )
}

const NODE_LIMITS = [5000, 20_000, 50_000, 100_000]

// the presets, with a limit a session states among them
function nodeLimitOptions(current: number) {
  return [...new Set([...NODE_LIMITS, current])]
    .sort((a, b) => a - b)
    .map(limit => ({ value: String(limit), label: limit.toLocaleString() }))
}

const trackOptions = (tracks: { trackId: string; name: string }[]) =>
  tracks.map(({ trackId, name }) => ({ value: trackId, label: name }))

// Toggles the menus already offer (halos, genes, color) stay out of here.
// `children` is the host's own part of the subgraph group.
const GraphSettingsDialog = observer(function GraphSettingsDialog(props: {
  model: GraphPaneModel
  open: boolean
  onClose: () => void
  children?: ReactNode
}) {
  const { model, open, onClose, children } = props
  const { classes } = useStyles()

  return (
    <Dialog open={open} onClose={onClose} title="Graph settings">
      <DialogContent>
        <Group title="Subgraph">
          {children}
          <SettingSelect
            label="Node limit"
            value={String(model.maxGraphNodes)}
            options={nodeLimitOptions(model.maxGraphNodes)}
            testId="graph-node-limit-select"
            onChange={limit => {
              model.setMaxGraphNodes(Number(limit))
            }}
          >
            <Caption>
              The most nodes a layout draws; past it the graph is declined. Walk
              rows take no limit.
            </Caption>
          </SettingSelect>
        </Group>

        <Group title="Drawing">
          {model.anchorPaths.length > 1 ? (
            <SettingSelect
              label="Reference path"
              value={model.activeReferencePath ?? ''}
              options={model.anchorPaths.map(({ name }) => ({
                value: name,
                label: name,
              }))}
              testId="graph-reference-path-select"
              onChange={name => {
                model.setReferencePath(name)
                void model.recomputeLayout()
              }}
            >
              <Caption>The path the anchored layouts place x along</Caption>
            </SettingSelect>
          ) : null}

          <SettingSelect
            label="Node width"
            value={model.nodeWidth}
            options={NODE_WIDTHS}
            testId="graph-node-width-select"
            onChange={width => {
              model.setNodeWidth(width)
            }}
          >
            <Caption>
              Depth as width. In a cut with walks, depth is how many haplotypes
              carry the node.
            </Caption>
          </SettingSelect>

          <SettingSwitch
            label="Draw paths"
            checked={model.drawPaths}
            onChange={draw => {
              model.setLayer('paths', draw)
            }}
          >
            <Caption>
              Color each node by the paths through it, one lane per path
            </Caption>
            {model.drawPaths && !model.effectiveDrawPaths ? (
              <Caption warn>
                {model.pathCount > MAX_PATH_COLORS
                  ? `Off: ${model.pathCount.toLocaleString()} paths is past the ${MAX_PATH_COLORS} this can tell apart`
                  : 'Off: this graph states no paths'}
              </Caption>
            ) : null}
          </SettingSwitch>

          {model.geneTrackChoices.length > 1 ? (
            <SettingSelect
              label="Gene track"
              value={model.geneTrack?.trackId ?? ''}
              options={trackOptions(model.geneTrackChoices)}
              testId="graph-gene-track-select"
              onChange={trackId => {
                model.setGeneTrackId(trackId)
              }}
            >
              <Caption>Where genes on the backbone come from</Caption>
            </SettingSelect>
          ) : null}

          {model.repeatTrackChoices.length > 1 ? (
            <SettingSelect
              label="Repeat track"
              value={model.repeatTrack?.trackId ?? ''}
              options={trackOptions(model.repeatTrackChoices)}
              testId="graph-repeat-track-select"
              onChange={trackId => {
                model.setRepeatTrackId(trackId)
              }}
            >
              <Caption>
                The tandem repeat annotation walk rows measure and tile by
              </Caption>
            </SettingSelect>
          ) : null}
        </Group>

        <Group title="Force-directed layout">
          {model.hasGraph && !model.usesLayoutEngine ? (
            <div className={classes.section}>
              <Caption warn>
                No effect on the current layout until Layout is Force-directed
              </Caption>
            </div>
          ) : null}

          <SettingSelect
            label="Engine"
            value={model.layoutEngine}
            options={LAYOUT_ENGINES}
            testId="graph-layout-engine-select"
            onChange={engine => {
              model.setLayoutEngine(engine)
            }}
          >
            <Caption>
              Stress keeps the reference straight, so a zoom keeps the picture;
              FMMM lets the whole graph settle.
            </Caption>
          </SettingSelect>

          <SettingSelect
            label="Layout quality"
            value={String(model.layoutQuality)}
            options={LAYOUT_QUALITIES.map(q => ({
              value: String(q.value),
              label: q.label,
            }))}
            testId="graph-layout-quality-select"
            onChange={quality => {
              model.setLayoutQuality(Number(quality))
            }}
          >
            <Caption>
              The engine&apos;s iteration budget; higher is slower
            </Caption>
          </SettingSelect>

          <SettingSelect
            label="Bubble spread"
            value={model.bubbleSpread}
            options={BUBBLE_SPREADS}
            testId="graph-bubble-spread-select"
            onChange={spread => {
              model.setBubbleSpread(spread)
            }}
          >
            <Caption>How far the layout opens a bubble</Caption>
          </SettingSelect>

          {model.layoutEngine === 'stress' ? null : (
            <SettingSwitch
              label="Linear layout"
              checked={model.linearLayout}
              onChange={linear => {
                model.setLinearLayout(linear)
              }}
            >
              <Caption>Keeps a chain of nodes on one line where it can</Caption>
            </SettingSwitch>
          )}
        </Group>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
})

export default GraphSettingsDialog
