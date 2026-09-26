import { Dialog } from '@jbrowse/core/ui'
import {
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
import Button from '@mui/material/Button'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import { MAX_PATH_COLORS } from '../pathColors'
import SubgraphContextSelect from './SubgraphContextSelect'
import SubgraphHaplotypesField from './SubgraphHaplotypesField'
import { BUBBLE_SPREADS } from '../bubbleSpreads'
import { COLOR_SCHEMES } from '../colorSchemes'
import { NODE_WIDTHS } from '../nodeWidths'

import type { GraphGenomeViewModel } from '../model'

const useStyles = makeStyles()({
  section: {
    marginBottom: 24,
  },
  formControl: {
    minWidth: 200,
  },
})

const qualityLabels = ['Lowest', 'Low', 'Medium', 'High', 'Highest'] as const

// Why a control is on and the drawing did not move. Layout quality and bubble
// spread are the engine's own inputs, and an anchored layout places a node from
// its coordinates without ever reaching the engine — so on those layouts these
// two settings do nothing, which the user guide has to state in prose because
// the dialog did not. Same reason and same shape as the `drawPaths` warning
// below. Left enabled rather than disabled: the setting is real and is what the
// force layout will be drawn with, so it is worth being able to choose it
// before switching, and the dropdown that makes it live is one row up in the
// toolbar.
const EngineOnly = observer(function EngineOnly({
  model,
}: {
  model: GraphGenomeViewModel
}) {
  return model.hasGraph && !model.usesLayoutEngine ? (
    <Typography variant="caption" color="warning.main">
      No effect on this layout: only the force-directed layout is drawn by the
      engine that reads this.
    </Typography>
  ) : null
})

const GraphSettingsDialog = observer(function GraphSettingsDialog(props: {
  model: GraphGenomeViewModel
  open: boolean
  onClose: () => void
}) {
  const { model, open, onClose } = props
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
                const quality = parseInt(e.target.value)
                model.setLayoutQuality(quality)
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
            <Typography variant="caption" color="text.secondary">
              FMMM&apos;s iteration budget, the same scale Bandage exposes.
              Higher is slower: on a thousand-node cut the top setting is
              seconds rather than tenths.
            </Typography>
            <EngineOnly model={model} />
          </FormControl>
        </div>

        <div className={classes.section}>
          <FormControlLabel
            control={
              <Switch
                checked={model.drawPaths}
                onChange={e => {
                  model.setDrawPaths(e.target.checked)
                }}
              />
            }
            label="Draw paths"
          />
          <Typography variant="caption" color="text.secondary">
            Color each node and connector by the paths through it, one lane per
            path in legend order, so a path that skips a node leaves its lane
            empty
          </Typography>
          {/* Why the switch is on and nothing changed. Past MAX_PATH_COLORS the
              hues are a degree apart and the key is taller than the drawing, so
              the setting resolves to off (see effectiveDrawPaths) — and a
              control that silently does nothing is worse than one that says it
              cannot. Left switchable rather than disabled: the graph can be
              recut to fewer paths without touching this dialog. */}
          {model.drawPaths && !model.effectiveDrawPaths ? (
            <Typography variant="caption" color="warning.main">
              {model.pathCount > MAX_PATH_COLORS
                ? `Off: ${model.pathCount.toLocaleString()} paths is past the ${MAX_PATH_COLORS} this can tell apart`
                : 'Off: this graph states no paths'}
            </Typography>
          ) : null}
        </div>

        <div className={classes.section}>
          <FormControlLabel
            control={
              <Switch
                checked={model.showBubbles}
                onChange={e => {
                  model.setShowBubbles(e.target.checked)
                }}
              />
            }
            label="Mark bubbles"
          />
          <Typography variant="caption" color="text.secondary">
            A halo along the nodes of each bubble, labelled by what it is, with
            the label opening the bubble on its own
          </Typography>
        </div>

        <div className={classes.section}>
          <FormControlLabel
            control={
              <Switch
                checked={model.showGenes}
                onChange={e => {
                  model.setShowGenes(e.target.checked)
                }}
              />
            }
            label="Genes on the backbone"
          />
          <Typography variant="caption" color="text.secondary">
            Exons along the reference nodes that carry them and each gene's name
            at its midpoint, from the assembly's annotation track
          </Typography>
          {model.geneTrackChoices.length > 1 ? (
            <FormControl className={classes.formControl} sx={{ mt: 1 }}>
              <InputLabel>Gene track</InputLabel>
              <Select
                value={model.geneTrack?.trackId ?? ''}
                label="Gene track"
                data-testid="graph-gene-track-select"
                onChange={e => {
                  model.setGeneTrackId(e.target.value)
                  void model.reloadGenes()
                }}
              >
                {model.geneTrackChoices.map(({ trackId, name }) => (
                  <MenuItem key={trackId} value={trackId}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          {model.repeatTrackChoices.length > 1 ? (
            <FormControl className={classes.formControl} sx={{ mt: 1 }}>
              <InputLabel>Repeat track</InputLabel>
              <Select
                value={model.repeatTrack?.trackId ?? ''}
                label="Repeat track"
                data-testid="graph-repeat-track-select"
                onChange={e => {
                  model.setRepeatTrackId(e.target.value)
                  void model.reloadRepeats()
                }}
              >
                {model.repeatTrackChoices.map(({ trackId, name }) => (
                  <MenuItem key={trackId} value={trackId}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
        </div>

        {model.anchorPaths.length > 1 ? (
          <div className={classes.section}>
            <FormControl className={classes.formControl}>
              <InputLabel>Reference path</InputLabel>
              <Select
                value={model.activeReferencePath ?? ''}
                label="Reference path"
                data-testid="graph-reference-path-select"
                onChange={e => {
                  model.setReferencePath(e.target.value)
                  void model.recomputeLayout()
                }}
              >
                {model.anchorPaths.map(({ name }) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Which path the anchored layouts draw x against. A GFA with no rGFA
              tags states its coordinates only in its paths, and marks none of
              them as the reference.
            </Typography>
          </div>
        ) : null}

        <div className={classes.section}>
          <FormControl className={classes.formControl}>
            <InputLabel>Bubble spread</InputLabel>
            <Select
              value={model.bubbleSpread}
              label="Bubble spread"
              data-testid="graph-bubble-spread-select"
              onChange={e => {
                model.setBubbleSpread(e.target.value)
                void model.recomputeLayout()
              }}
            >
              {BUBBLE_SPREADS.map(({ value, label, description }) => (
                <MenuItem key={value} value={value}>
                  <Tooltip title={description} placement="right">
                    <span>{label}</span>
                  </Tooltip>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary">
            How far the force layout opens a bubble. A pangenome allele is a few
            bp, so at Bandage&apos;s own scale both arms land inside one node
            thickness and the graph draws as a rope.
          </Typography>
          <EngineOnly model={model} />
        </div>

        <div className={classes.section}>
          <FormControl className={classes.formControl}>
            <InputLabel>Node width</InputLabel>
            <Select
              value={model.nodeWidth}
              label="Node width"
              data-testid="graph-node-width-select"
              onChange={e => {
                model.setNodeWidth(e.target.value)
              }}
            >
              {NODE_WIDTHS.map(({ value, label, description }) => (
                <MenuItem key={value} value={value}>
                  <Tooltip title={description} placement="right">
                    <span>{label}</span>
                  </Tooltip>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary">
            Bandage&apos;s depth as width. In a cut with walks, depth is how
            many haplotypes carry the node.
          </Typography>
        </div>

        <SubgraphContextSelect model={model} />

        <SubgraphHaplotypesField model={model} />

        <div className={classes.section}>
          <FormControl className={classes.formControl}>
            <InputLabel>Color scheme</InputLabel>
            <Select
              value={model.colorScheme}
              label="Color scheme"
              onChange={e => {
                model.setColorScheme(e.target.value)
              }}
            >
              {COLOR_SCHEMES.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
