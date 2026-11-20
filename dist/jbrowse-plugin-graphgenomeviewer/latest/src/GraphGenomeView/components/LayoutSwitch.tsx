import { CascadingMenuButton } from '@jbrowse/core/ui'
import { observer } from 'mobx-react'

import { MenuButton, useKeyControlStyles } from './keyControls'

import type { MenuItem } from '@jbrowse/core/ui'

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
  const { classes, cx } = useKeyControlStyles()
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
      <span className={classes.joined}>
        {engines.map(({ name, about, row }) => (
          <button
            key={name}
            type="button"
            className={cx(classes.button, row.checked && classes.on)}
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
        ButtonComponent={MenuButton}
        menuItems={() => model.layoutMenuItems()}
        className={cx(classes.button, other && classes.on)}
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
