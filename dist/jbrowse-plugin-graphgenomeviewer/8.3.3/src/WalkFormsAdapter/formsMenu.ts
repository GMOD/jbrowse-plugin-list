import { readConfObject } from '@jbrowse/core/configuration'
import { DisplayType } from '@jbrowse/core/pluggableElementTypes'
import { getContainingView, getSession } from '@jbrowse/core/util'
import { types } from '@jbrowse/mobx-state-tree'

import { floorOf, pinnedLocus, pinnedOf, warningPrefix } from './pinned.ts'
import { hostWindow, isLinearHost } from '../GraphGenomeView/host.ts'

import type { FloorBp, Pinned } from './pinned.ts'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { AnyConfigurationModel } from '@jbrowse/core/configuration'
import type { MenuItem } from '@jbrowse/core/ui'
import type { IAnyModelType, IAnyStateTreeNode } from '@jbrowse/mobx-state-tree'

export const FORMS_DISPLAYS = ['LinearMultiSampleVariantDisplay']

export const FLOORS: { label: string; value: FloorBp }[] = [
  { label: 'Auto', value: 'auto' },
  { label: '50 bp', value: 50 },
  { label: '1 kb', value: 1000 },
  { label: '10 kb', value: 10_000 },
]

export function pinnedLabel(pinned: Pinned | undefined, forms?: number) {
  return pinned
    ? `Pinned to ${pinnedLocus(pinned)}${forms === undefined ? '' : ` · ${forms} form${forms === 1 ? '' : 's'}`}`
    : 'Not pinned'
}

interface FormsHost {
  parentTrack: { configuration: AnyConfigurationModel }
  sourcesBase?: Record<string, unknown>[]
  trackMenuItems: () => MenuItem[]
  setSources?: (sources: unknown, adapterConfig?: unknown) => void
}

interface Snackbar {
  snackbarMessages?: { message: string }[]
  removeSnackbarMessage?: (message: string) => void
}

function clearWarnings(
  node: IAnyStateTreeNode,
  windows: (Pinned | undefined)[],
) {
  const session = getSession(node) as unknown as Snackbar
  const prefixes = windows.flatMap(w => (w ? [warningPrefix(w)] : []))
  for (const { message } of [...(session.snackbarMessages ?? [])]) {
    if (prefixes.some(p => message.startsWith(p))) {
      session.removeSnackbarMessage?.(message)
    }
  }
}

/**
 * Gives a WalkFormsAdapter track's display a pinned window and floor of its
 * own, which the display stores in the session and sends in the adapter config
 * with each request. A config edit would change the track's RPC session id
 * and move the requests to a worker without the cut; display state leaves it.
 */
export function withFormsMenu(model: IAnyModelType) {
  return model
    .props({
      formsPinned: types.maybe(types.frozen<Pinned>()),
      formsFloorBp: types.maybe(types.frozen<FloorBp>()),
    })
    .views(self => ({
      get configuredAdapter(): Record<string, unknown> {
        return readConfObject(
          (self as unknown as FormsHost).parentTrack.configuration,
          'adapter',
        ) as Record<string, unknown>
      },
      get walkForms() {
        return this.configuredAdapter.type === 'WalkFormsAdapter'
      },
    }))
    .views(self => ({
      get adapterConfig(): Record<string, unknown> {
        const conf = self.configuredAdapter
        return self.walkForms
          ? {
              ...conf,
              ...(self.formsPinned ? { pinned: self.formsPinned } : {}),
              ...(self.formsFloorBp === undefined
                ? {}
                : { floorBp: self.formsFloorBp }),
            }
          : conf
      },
      get formsWindow() {
        return pinnedOf(this.adapterConfig.pinned)
      },
      get formsFloor() {
        return floorOf(this.adapterConfig.floorBp)
      },
      get formsCount() {
        return (self as unknown as FormsHost).sourcesBase?.reduce(
          (n, row) => n + (Number(row.forms) || 1),
          0,
        )
      },
      get visibleWindow(): Pinned | undefined {
        const view: unknown = getContainingView(self)
        const window = isLinearHost(view) ? hostWindow(view) : undefined
        return window && window.end > window.start
          ? {
              refName: window.refName,
              start: Math.max(0, Math.floor(window.start)),
              end: Math.ceil(window.end),
            }
          : undefined
      },
    }))
    .volatile(() => ({
      warnedWindow: undefined as Pinned | undefined,
    }))
    .actions(self => {
      const { setSources: superSetSources } = self as unknown as FormsHost
      const clearFormsWarnings = () => {
        clearWarnings(self, [self.warnedWindow, self.formsWindow])
      }
      return {
        setFormsPinned(pinned: Pinned) {
          clearFormsWarnings()
          self.formsPinned = pinned
        },
        setFormsFloorBp(floorBp: FloorBp) {
          clearFormsWarnings()
          self.formsFloorBp = floorBp
        },
        // Core posts the new forms' warnings right after this, so the old
        // ones come down first
        setSources(sources: unknown, adapterConfig?: unknown) {
          if (self.walkForms) {
            clearFormsWarnings()
            self.warnedWindow = self.formsWindow
          }
          superSetSources?.(sources, adapterConfig)
        },
      }
    })
    .views(self => {
      const { trackMenuItems: superTrackMenuItems } =
        self as unknown as FormsHost
      return {
        formsMenuItems(): MenuItem[] {
          const pinned = self.formsWindow
          const visible = self.visibleWindow
          return [
            {
              label: pinnedLabel(pinned, self.formsCount),
              disabled: true,
              onClick: () => {},
            },
            {
              label: 'Re-pin to visible region',
              helpText:
                'Cut the forms from the region the view shows. Panning and zooming leave the forms alone',
              disabled:
                !visible ||
                (pinned !== undefined &&
                  pinnedLocus(visible) === pinnedLocus(pinned)),
              onClick: () => {
                if (visible) {
                  self.setFormsPinned(visible)
                }
              },
            },
            {
              label: 'Hide changes under',
              subMenu: FLOORS.map(({ label, value }) => ({
                label,
                type: 'radio' as const,
                checked: self.formsFloor === value,
                onClick: () => {
                  self.setFormsFloorBp(value)
                },
              })),
            },
          ]
        },
        trackMenuItems(): MenuItem[] {
          return self.walkForms
            ? [...superTrackMenuItems(), ...this.formsMenuItems()]
            : superTrackMenuItems()
        },
      }
    })
}

export default function WalkFormsMenuF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint('Core-extendPluggableElement', element => {
    if (
      element instanceof DisplayType &&
      FORMS_DISPLAYS.includes(element.name)
    ) {
      element.extendStateModel(withFormsMenu)
    }
    return element
  })
}
