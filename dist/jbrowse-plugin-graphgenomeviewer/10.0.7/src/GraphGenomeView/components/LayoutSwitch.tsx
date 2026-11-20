import { CascadingMenuButton } from '@jbrowse/core/ui'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import { HEADING_INK, legendBoxStyle, legendHeadingStyle } from './legendStyles'

import type { MenuItem } from '@jbrowse/core/ui'

const INK = '#1c1c22'
const HOVER_PAPER = '#eef1f3'
const FOCUS_RING = '#1a56c4'

const useStyles = makeStyles()({
  row: {
    ...legendBoxStyle,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: INK,
  },
  heading: legendHeadingStyle,
  engines: {
    display: 'flex',
    '& > button + button': { marginLeft: -1 },
    '& > button:first-of-type': { borderRadius: '3px 0 0 3px' },
    '& > button:last-of-type': { borderRadius: '0 3px 3px 0' },
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    font: 'inherit',
    color: 'inherit',
    background: legendBoxStyle.background,
    border: `1px solid ${HEADING_INK}`,
    borderRadius: 3,
    padding: '0 6px',
    cursor: 'pointer',
    '&:hover': { background: HOVER_PAPER },
    '&:disabled': { color: HEADING_INK, cursor: 'default' },
    '&:focus-visible': {
      outline: `2px solid ${FOCUS_RING}`,
      outlineOffset: 1,
      position: 'relative',
      zIndex: 1,
    },
  },
  drawn: {
    color: legendBoxStyle.background,
    background: HEADING_INK,
    '&:hover': { background: HEADING_INK },
  },
})

const ListButton = observer(function ListButton(
  props: React.ComponentProps<'button'>,
) {
  return <button type="button" {...props} />
})

// The two force engines as a switch, each named as the track menu's Layout
// rows name it and running its row, then that menu's whole list, whose button
// names the layout drawn when it is neither engine's
const LayoutSwitch = observer(function LayoutSwitch({
  model,
}: {
  model: {
    layoutLabel: () => string
    layoutMenuItems: () => MenuItem[]
    forceEngineRows: () => {
      name: string
      about: string
      row: {
        label: string
        checked: boolean
        disabled: boolean
        disabledHelpText: string
        onClick: () => void
      }
    }[]
  }
}) {
  const { classes, cx } = useStyles()
  const engines = model.forceEngineRows()
  const other = !engines.some(engine => engine.row.checked)
  return (
    <div
      className={classes.row}
      role="group"
      aria-label="Layout"
      data-testid="graph-layout-switch"
    >
      <span className={classes.heading}>Layout</span>
      <span className={classes.engines}>
        {engines.map(({ name, about, row }) => (
          <button
            key={name}
            type="button"
            className={cx(classes.button, row.checked && classes.drawn)}
            aria-pressed={row.checked}
            disabled={row.disabled}
            title={
              row.disabled ? row.disabledHelpText : `${row.label}. ${about}`
            }
            onClick={row.onClick}
          >
            {name}
          </button>
        ))}
      </span>
      <CascadingMenuButton
        ButtonComponent={ListButton}
        menuItems={() => model.layoutMenuItems()}
        className={cx(classes.button, other && classes.drawn)}
        title="Every layout"
        aria-haspopup="menu"
      >
        <span>{other ? model.layoutLabel() : 'more'}</span>
        <span aria-hidden>▾</span>
      </CascadingMenuButton>
    </div>
  )
})

export default LayoutSwitch
