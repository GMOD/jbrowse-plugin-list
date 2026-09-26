import PluginManager from '@jbrowse/core/PluginManager'
import {
  ConfigurationReference,
  ConfigurationSchema,
  getConf,
} from '@jbrowse/core/configuration'
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'
import DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'
import TrackType from '@jbrowse/core/pluggableElementTypes/TrackType'
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import {
  BaseDisplay,
  createBaseTrackConfig,
  createBaseTrackModel,
} from '@jbrowse/core/pluggableElementTypes/models'
import { LAUNCH_LABEL } from '@jbrowse/core/ui'
import { getContainingTrack } from '@jbrowse/core/util'
import { types } from '@jbrowse/mobx-state-tree'
import { linearGenomeViewStateModelFactory } from '@jbrowse/plugin-linear-genome-view'

import LaunchSubgraphMenuItemF from './index'
import LinearViewMenuItemsF from './linearViewMenuItems'

import type { MenuItem } from '@jbrowse/core/ui'
import type { Instance } from '@jbrowse/mobx-state-tree'

const LABEL = 'Graph genome view (this region)'

// A stand-in for core's MultiWaySyntenyDisplay with the four members the
// launch reads by duck type (subgraphTracks.ts): the lanes in force are the
// picker's choice, else the track's own lanes, and a hidden lane stays in
// force.
function laneDisplayType() {
  const configSchema = ConfigurationSchema(
    'MultiWaySyntenyDisplay',
    {},
    { explicitIdentifier: 'displayId', explicitlyTyped: true },
  )
  const stateModel = types
    .compose(
      'MultiWaySyntenyDisplay',
      BaseDisplay,
      types.model({
        type: types.literal('MultiWaySyntenyDisplay'),
        configuration: ConfigurationReference(configSchema),
      }),
    )
    .volatile(() => ({
      picked: undefined as string[] | undefined,
      hidden: [] as string[],
    }))
    .views(self => ({
      get laneSelection(): readonly string[] | undefined {
        const configured = getConf(
          getContainingTrack(self),
          'assemblyNames',
        ).slice(1)
        return self.picked ?? (configured.length ? configured : undefined)
      },
      get hiddenLanes(): readonly string[] {
        return self.hidden
      },
      trackMenuItems(): MenuItem[] {
        return []
      },
    }))
    .actions(self => ({
      setSelectedLanes(names: string[] | undefined) {
        self.picked = names
      },
      hideLane(name: string) {
        self.hidden = [...self.hidden, name]
      },
    }))
  return new DisplayType({
    name: 'MultiWaySyntenyDisplay',
    configSchema,
    stateModel,
    trackType: 'SyntenyTrack',
    viewType: 'LinearGenomeView',
    ReactComponent: () => null,
  })
}

function createEnv(trackLanes: string[] = []) {
  console.warn = vi.fn()
  console.error = vi.fn()
  const pluginManager = new PluginManager()
  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'GbzBaseSyntenyAdapter',
        configSchema: ConfigurationSchema(
          'GbzBaseSyntenyAdapter',
          {},
          { explicitlyTyped: true },
        ),
        adapterCapabilities: ['getSubgraph', 'headerLanes'],
        getAdapterClass: () => {
          throw new Error('config-only')
        },
      }),
  )
  pluginManager.addTrackType(() => {
    const schema = ConfigurationSchema(
      'SyntenyTrack',
      {},
      {
        baseConfiguration: createBaseTrackConfig(pluginManager),
        explicitIdentifier: 'trackId',
      },
    )
    return new TrackType({
      name: 'SyntenyTrack',
      configSchema: schema,
      stateModel: createBaseTrackModel(pluginManager, 'SyntenyTrack', schema),
    })
  })
  pluginManager.addDisplayType(() => laneDisplayType())
  pluginManager.addViewType(
    () =>
      new ViewType({
        name: 'LinearGenomeView',
        stateModel: linearGenomeViewStateModelFactory(pluginManager),
        ReactComponent: () => null,
      }),
  )
  LaunchSubgraphMenuItemF(pluginManager)
  LinearViewMenuItemsF(pluginManager)
  pluginManager.createPluggableElements()
  pluginManager.configure()

  const track = pluginManager.pluggableConfigSchemaType('track').create(
    {
      type: 'SyntenyTrack',
      trackId: 'gbz_lanes',
      name: 'GBZ lanes',
      assemblyNames: ['volvox', ...trackLanes],
      adapter: { type: 'GbzBaseSyntenyAdapter' },
      displays: [
        {
          type: 'MultiWaySyntenyDisplay',
          displayId: 'gbz_lanes-MultiWaySyntenyDisplay',
        },
      ],
    },
    { pluginManager },
  )
  const assemblyRegions = [
    { refName: 'ctgA', start: 0, end: 50_000, assemblyName: 'volvox' },
  ]
  const assembly = {
    initialized: true,
    regions: assemblyRegions,
    getCanonicalRefName: (refName: string) => refName,
    getGeneticCodeId: () => undefined,
    getRegionForRefName: (refName: string) =>
      assemblyRegions.find(r => r.refName === refName),
    configuration: { sequence: undefined },
  }
  const LGV = pluginManager.getViewType('LinearGenomeView').stateModel
  const Session = types
    .model({
      name: 'testSession',
      view: types.maybe(LGV),
      configuration: types.map(types.frozen()),
    })
    .volatile(() => ({
      tracks: [track],
      connectionInstances: [],
      addedViews: [] as [string, Record<string, unknown>][],
      rpcManager: { call: vi.fn() },
      assemblyManager: {
        get: (name: string) => (name === 'volvox' ? assembly : undefined),
        waitForAssembly: () => Promise.resolve(assembly),
        isValidRefName: (refName: string) => refName === 'ctgA',
      },
    }))
    .views(self => ({
      getTrackById: (id: string) => (id === 'gbz_lanes' ? track : undefined),
      get assemblies() {
        return []
      },
      get views() {
        return self.view ? [self.view] : []
      },
      getDisplayTypeDefault() {
        return undefined
      },
    }))
    .actions(self => ({
      setView(view: Instance<typeof LGV>) {
        self.view = view
        return view
      },
      addView(type: string, snapshot: Record<string, unknown>) {
        self.addedViews.push([type, snapshot])
        return snapshot
      },
      notify() {},
      notifyError() {},
    }))
  const session = Session.create({ configuration: {} }, { pluginManager })
  const view = session.setView(
    LGV.create({
      type: 'LinearGenomeView',
      tracks: [
        {
          type: 'SyntenyTrack',
          configuration: 'gbz_lanes',
          displays: [
            {
              type: 'MultiWaySyntenyDisplay',
              configuration: 'gbz_lanes-MultiWaySyntenyDisplay',
            },
          ],
        },
      ],
    }),
  )
  view.setWidth(800)
  view.setDisplayedRegions([
    { refName: 'ctgA', start: 0, end: 1000, assemblyName: 'volvox' },
  ])
  const display = view.tracks[0]!.displays[0]!
  return { session, view, display }
}

function allLabels(items: MenuItem[]): string[] {
  return items.flatMap(item => [
    ...('label' in item ? [item.label] : []),
    ...('subMenu' in item && Array.isArray(item.subMenu)
      ? allLabels(item.subMenu)
      : []),
  ])
}

function launchRegion(view: { menuItems: () => MenuItem[] }) {
  const launch = view
    .menuItems()
    .find(i => 'label' in i && i.label === LAUNCH_LABEL)
  const item =
    launch && 'subMenu' in launch
      ? launch.subMenu.find(i => 'label' in i && i.label === LABEL)
      : undefined
  if (item && 'onClick' in item) {
    item.onClick(undefined)
  } else {
    throw new Error(`no ${LABEL} in the view menu`)
  }
}

// pangenome_hprc_part3 sends readers to the linear view's menu for this, since
// the lane track's own menu is core's and carries no graph launch.
test("the GBZ cut is on the linear view's menu, not the lane track's", () => {
  const { view, display } = createEnv()
  expect(allLabels(view.menuItems())).toContain(LABEL)
  expect(allLabels(display.trackMenuItems())).not.toContain(LABEL)
})

test("a launch cuts for the lanes the reader picked over the track's lanes", () => {
  const { session, view, display } = createEnv(['HG00097.1', 'HG00099.1'])
  display.setSelectedLanes(['HG00128.1'])
  launchRegion(view)
  expect(session.addedViews[0]![1].subgraphHaplotypes).toEqual(['HG00128.1'])
})

test('a launch cuts for the pick where the track names no lanes', () => {
  const { session, view, display } = createEnv()
  display.setSelectedLanes(['HG00128.1'])
  launchRegion(view)
  expect(session.addedViews[0]![1].subgraphHaplotypes).toEqual(['HG00128.1'])
})

test('a lane hidden on the track is left out of the cut', () => {
  const { session, view, display } = createEnv(['HG00097.1', 'HG00099.1'])
  display.hideLane('HG00097.1')
  launchRegion(view)
  expect(session.addedViews[0]![1].subgraphHaplotypes).toEqual(['HG00099.1'])
})

test("with no pick a launch cuts for the track's lanes", () => {
  const { session, view } = createEnv(['HG00097.1', 'HG00099.1'])
  launchRegion(view)
  expect(session.addedViews[0]![1].subgraphHaplotypes).toEqual([
    'HG00097.1',
    'HG00099.1',
  ])
})
