import type { ReactNode } from 'react'

import { BUBBLE_SPREADS } from '@jbrowse/bandage-core/bubbleSpreads'
import { COLOR_SCHEMES } from '@jbrowse/bandage-core/colorSchemes'
import { NODE_WIDTHS } from '@jbrowse/bandage-core/nodeWidths'
import { MAX_PATH_COLORS } from '@jbrowse/bandage-core/pathColors'
import { Dialog } from '@jbrowse/core/ui'
import {
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import type { GraphPaneModel } from '../model'
import type { SxProps } from '@mui/material'

const useStyles = makeStyles()({
  section: {
    marginBottom: 24,
  },
  formControl: {
    minWidth: 200,
  },
})

const qualityLabels = ['Lowest', 'Low', 'Medium', 'High', 'Highest'] as const

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
      color={warn ? 'warning.main' : 'text.secondary'}
    >
      {children}
    </Typography>
  )
}

// Layout quality and bubble spread are the engine's inputs, and an anchored
// layout places a node from its coordinates without reaching it. Left enabled
// so the force layout can be set up before switching to it.
const EngineOnly = observer(function EngineOnly({
  model,
}: {
  model: GraphPaneModel
}) {
  return model.hasGraph && !model.usesLayoutEngine ? (
    <Caption warn>
      No effect on this layout: only the force-directed layout is drawn by the
      engine that reads this.
    </Caption>
  ) : null
})

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

// One dropdown setting; an option's description is its tooltip
function SettingSelect<T extends string>({
  label,
  value,
  options,
  testId,
  sx,
  onChange,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string; description?: string }[]
  testId?: string
  sx?: SxProps
  onChange: (value: T) => void
}) {
  const { classes } = useStyles()
  return (
    <FormControl className={classes.formControl} sx={sx}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        data-testid={testId}
        onChange={e => {
          onChange(e.target.value as T)
        }}
      >
        {options.map(({ value, label, description }) => (
          <MenuItem key={value} value={value}>
            {description ? (
              <Tooltip title={description} placement="right">
                <span>{label}</span>
              </Tooltip>
            ) : (
              label
            )}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

const trackOptions = (tracks: { trackId: string; name: string }[]) =>
  tracks.map(({ trackId, name }) => ({ value: trackId, label: name }))

// `children` is the host's own section, between node width and colour
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
        <div className={classes.section}>
          <FormControl fullWidth>
            <FormLabel component="legend">Layout quality</FormLabel>
            <RadioGroup
              value={model.layoutQuality}
              onChange={e => {
                model.setLayoutQuality(parseInt(e.target.value))
                void model.recomputeLayout()
              }}
            >
              {qualityLabels.map((label, i) => (
                <FormControlLabel
                  key={label}
                  value={i}
                  control={<Radio />}
                  label={label}
                />
              ))}
            </RadioGroup>
            <Caption>
              FMMM&apos;s iteration budget, the same scale Bandage exposes.
              Higher is slower: on a thousand-node cut the top setting is
              seconds rather than tenths.
            </Caption>
            <EngineOnly model={model} />
          </FormControl>
        </div>

        <SettingSwitch
          label="Draw paths"
          checked={model.drawPaths}
          onChange={draw => {
            model.setDrawPaths(draw)
          }}
        >
          <Caption>
            Color each node and connector by the paths through it, one lane per
            path in legend order, so a path that skips a node leaves its lane
            empty
          </Caption>
          {model.drawPaths && !model.effectiveDrawPaths ? (
            <Caption warn>
              {model.pathCount > MAX_PATH_COLORS
                ? `Off: ${model.pathCount.toLocaleString()} paths is past the ${MAX_PATH_COLORS} this can tell apart`
                : 'Off: this graph states no paths'}
            </Caption>
          ) : null}
        </SettingSwitch>

        <SettingSwitch
          label="Mark bubbles"
          checked={model.showBubbles}
          onChange={show => {
            model.setShowBubbles(show)
          }}
        >
          <Caption>
            A halo along the nodes of each bubble, labelled by what it is, with
            the label opening the bubble on its own
          </Caption>
        </SettingSwitch>

        <SettingSwitch
          label="Genes on the backbone"
          checked={model.showGenes}
          onChange={show => {
            model.setShowGenes(show)
          }}
        >
          <Caption>
            Exons along the reference nodes that carry them and each gene's name
            at its midpoint, from the assembly's annotation track
          </Caption>
          {model.geneTrackChoices.length > 1 ? (
            <SettingSelect
              label="Gene track"
              value={model.geneTrack?.trackId ?? ''}
              options={trackOptions(model.geneTrackChoices)}
              testId="graph-gene-track-select"
              sx={{ mt: 1 }}
              onChange={trackId => {
                model.setGeneTrackId(trackId)
                void model.reloadGenes()
              }}
            />
          ) : null}
          {model.repeatTrackChoices.length > 1 ? (
            <SettingSelect
              label="Repeat track"
              value={model.repeatTrack?.trackId ?? ''}
              options={trackOptions(model.repeatTrackChoices)}
              testId="graph-repeat-track-select"
              sx={{ mt: 1 }}
              onChange={trackId => {
                model.setRepeatTrackId(trackId)
                void model.reloadRepeats()
              }}
            />
          ) : null}
        </SettingSwitch>

        {model.anchorPaths.length > 1 ? (
          <div className={classes.section}>
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
            />
            <Caption>
              Which path the anchored layouts draw x against. A GFA with no rGFA
              tags states its coordinates only in its paths, and marks none of
              them as the reference.
            </Caption>
          </div>
        ) : null}

        <div className={classes.section}>
          <SettingSelect
            label="Bubble spread"
            value={model.bubbleSpread}
            options={BUBBLE_SPREADS}
            testId="graph-bubble-spread-select"
            onChange={spread => {
              model.setBubbleSpread(spread)
              void model.recomputeLayout()
            }}
          />
          <Caption>
            How far the force layout opens a bubble. A pangenome allele is a few
            bp, so at Bandage&apos;s own scale both arms land inside one node
            thickness and the graph draws as a rope.
          </Caption>
          <EngineOnly model={model} />
        </div>

        <div className={classes.section}>
          <SettingSelect
            label="Node width"
            value={model.nodeWidth}
            options={NODE_WIDTHS}
            testId="graph-node-width-select"
            onChange={width => {
              model.setNodeWidth(width)
            }}
          />
          <Caption>
            Bandage&apos;s depth as width. In a cut with walks, depth is how
            many haplotypes carry the node.
          </Caption>
        </div>

        {children}

        <div className={classes.section}>
          <SettingSelect
            label="Color scheme"
            value={model.chosenColorScheme}
            options={COLOR_SCHEMES}
            onChange={scheme => {
              model.setColorScheme(scheme)
            }}
          />
          {model.colorSchemeLock ? (
            <Caption warn>No effect now. {model.colorSchemeLock.why}</Caption>
          ) : null}
        </div>
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
