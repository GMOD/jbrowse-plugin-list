import { LAUNCH_LABEL, pushLaunchViewMenuItem } from '@jbrowse/core/ui'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'

import type { MenuItem, SubMenuItem } from '@jbrowse/core/ui'

export function pushLaunchItem(items: MenuItem[], item: MenuItem) {
  pushLaunchViewMenuItem(items, item)
  const group = items.find(
    (i): i is SubMenuItem => 'subMenu' in i && i.label === LAUNCH_LABEL,
  )
  if (group && !group.icon) {
    group.icon = RocketLaunchIcon
  }
}
