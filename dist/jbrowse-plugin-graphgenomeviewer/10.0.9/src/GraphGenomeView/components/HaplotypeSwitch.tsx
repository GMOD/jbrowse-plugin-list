import { CascadingMenuButton } from '@jbrowse/core/ui'
import { observer } from 'mobx-react'

import { MenuButton, useKeyControlStyles } from './keyControls'

import type { MenuItem } from '@jbrowse/core/ui'

const HaplotypeSwitch = observer(function HaplotypeSwitch({
  model,
  inline = false,
}: {
  inline?: boolean
  model: {
    walkChoices: readonly { name: string }[]
    walkLayers: readonly { walk: string }[]
    highlightMenuItems: () => MenuItem[]
  }
}) {
  const { classes, cx } = useKeyControlStyles()
  const { walkChoices } = model
  const highlighted = model.walkLayers.filter(layer =>
    walkChoices.some(choice => choice.name === layer.walk),
  ).length
  return model.highlightMenuItems().length > 0 ? (
    <div
      className={cx(classes.row, inline && classes.inline)}
      role="group"
      aria-label="Haplotypes"
      data-testid="graph-haplotype-switch"
    >
      <span className={classes.heading}>Haplotypes</span>
      <CascadingMenuButton
        ButtonComponent={MenuButton}
        menuItems={() => model.highlightMenuItems()}
        className={cx(classes.button, highlighted > 0 && classes.on)}
        title="Highlight haplotypes"
        aria-haspopup="menu"
      >
        <span>
          {highlighted > 0
            ? `${highlighted} of ${walkChoices.length}`
            : 'highlight'}
        </span>
        <span aria-hidden>▾</span>
      </CascadingMenuButton>
    </div>
  ) : null
})

export default HaplotypeSwitch
