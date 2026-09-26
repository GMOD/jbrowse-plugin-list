import PluginManager from '@jbrowse/core/PluginManager'
import {
  ConfigurationSchema,
  readConfObject,
} from '@jbrowse/core/configuration'
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'
import DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'
import TrackType from '@jbrowse/core/pluggableElementTypes/TrackType'
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import {
  createBaseTrackConfig,
  createBaseTrackModel,
} from '@jbrowse/core/pluggableElementTypes/models'
import { types } from '@jbrowse/mobx-state-tree'
import { linearBasicDisplayConfigSchemaFactory } from '@jbrowse/plugin-canvas'
// The state model factory is NOT on that barrel, and deliberately: a value edge
// from there would keep the display model subgraph eager, which is the point of
// the host's lazy display registration. Its own subpath is the way in, and it is
// that module's default export.
import linearBasicDisplayStateModelFactory from '@jbrowse/plugin-canvas/LinearBasicDisplay/stateModel'
import { linearGenomeViewStateModelFactory } from '@jbrowse/plugin-linear-genome-view'

import LaunchSubgraphMenuItemF from './index'
import LinearViewMenuItemsF from './linearViewMenuItems'

import type { Instance } from '@jbrowse/mobx-state-tree'

// The real LinearBasicDisplay in a real LinearGenomeView, so the launch menu is
// exercised against the display API it actually extends (`trackMenuItems`,
// `contextMenuItems`, `contextMenuInfo`) rather than a stand-in that can't
// drift with it. Modelled on plugins/canvas's own LinearBasicDisplay testEnv.
export function createTestEnvironment({
  subgraphCapable = true,
  graphAssemblyNames = ['volvox'],
}: { subgraphCapable?: boolean; graphAssemblyNames?: string[] } = {}) {
  console.warn = vi.fn()
  console.error = vi.fn()
  const pluginManager = new PluginManager()

  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'TestGraphAdapter',
        // explicitlyTyped so the config keeps its `type`, which is how the
        // menu finds the adapter type to ask for capabilities
        configSchema: ConfigurationSchema(
          'TestGraphAdapter',
          {},
          { explicitlyTyped: true },
        ),
        adapterCapabilities: subgraphCapable ? ['getSubgraph'] : [],
        getAdapterClass: () => {
          throw new Error('TestGraphAdapter is config-only in tests')
        },
      }),
  )

  // Stands in for MinigraphBubbleAdapter: a real track on the same assembly that
  // marks where variation is but cannot cut a graph itself.
  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'TestBubbleAdapter',
        configSchema: ConfigurationSchema(
          'TestBubbleAdapter',
          {},
          { explicitlyTyped: true },
        ),
        adapterCapabilities: [],
        getAdapterClass: () => {
          throw new Error('TestBubbleAdapter is config-only in tests')
        },
      }),
  )

  pluginManager.addTrackType(() => {
    const trackConfigSchema = ConfigurationSchema(
      'FeatureTrack',
      {},
      {
        baseConfiguration: createBaseTrackConfig(pluginManager),
        explicitIdentifier: 'trackId',
      },
    )
    return new TrackType({
      name: 'FeatureTrack',
      configSchema: trackConfigSchema,
      stateModel: createBaseTrackModel(
        pluginManager,
        'FeatureTrack',
        trackConfigSchema,
      ),
    })
  })

  const configSchema = linearBasicDisplayConfigSchemaFactory(pluginManager)
  pluginManager.addDisplayType(
    () =>
      new DisplayType({
        name: 'LinearBasicDisplay',
        configSchema,
        stateModel: linearBasicDisplayStateModelFactory(configSchema),
        trackType: 'FeatureTrack',
        viewType: 'LinearGenomeView',
        ReactComponent: () => null,
      }),
  )

  // The view type has to be *registered*, not just instantiated from its
  // factory: the view-level menu items are added by extending the registered
  // ViewType's state model, so a view built straight from the factory would
  // silently exercise an unextended model and the items would never appear.
  pluginManager.addViewType(
    () =>
      new ViewType({
        name: 'LinearGenomeView',
        stateModel: linearGenomeViewStateModelFactory(pluginManager),
        // never rendered here; the state model is what's under test
        ReactComponent: () => null,
      }),
  )

  // registered before createPluggableElements, which is when
  // Core-extendPluggableElement runs over each element
  LaunchSubgraphMenuItemF(pluginManager)
  LinearViewMenuItemsF(pluginManager)
  pluginManager.createPluggableElements()
  pluginManager.configure()

  const LinearGenomeModel =
    pluginManager.getViewType('LinearGenomeView').stateModel
  const trackSchema = pluginManager.pluggableConfigSchemaType('track')
  const trackConfig = trackSchema.create(
    {
      type: 'FeatureTrack',
      trackId: 'graph_track',
      name: 'rGFA segments',
      assemblyNames: graphAssemblyNames,
      adapter: { type: 'TestGraphAdapter' },
    },
    { pluginManager },
  )
  const bubbleTrackConfig = trackSchema.create(
    {
      type: 'FeatureTrack',
      trackId: 'bubble_track',
      name: 'bubbles',
      assemblyNames: ['volvox'],
      adapter: { type: 'TestBubbleAdapter' },
    },
    { pluginManager },
  )
  const trackConfigs = [trackConfig, bubbleTrackConfig]

  const assemblyRegions = [
    { refName: 'ctgA', start: 0, end: 50_000, assemblyName: 'volvox' },
  ]

  const assembly = {
    initialized: true,
    regions: assemblyRegions,
    getCanonicalRefName: (refName: string) => refName,
    // what the LGV's navTo resolves a location's refName through
    getCanonicalRefName2: (refName: string) => refName,
    getGeneticCodeId: () => undefined,
    // The LGV's `showsWholeChromosome` reads this (through `canShowCytobands`)
    // as of jbrowse-components 33c15386b3, and a stub without it throws rather
    // than reading as "no cytobands". Same answer as the real one: the region
    // for a refName the assembly declares, undefined otherwise.
    getRegionForRefName: (refName: string) =>
      assemblyRegions.find(r => r.refName === refName),
    configuration: { sequence: undefined },
  }

  const Session = types
    .model({
      name: 'testSession',
      view: types.maybe(LinearGenomeModel),
      configuration: types.map(types.frozen()),
      displayTypeDefaults: types.frozen<
        Record<string, Record<string, unknown>>
      >({}),
    })
    .volatile(() => ({
      addedViews: [] as [string, Record<string, unknown>][],
      notifications: [] as string[],
      // isSessionModel keys on rpcManager + configuration; the launch menu
      // never calls it, but getSession has to find this node
      rpcManager: { call: vi.fn() },
      assemblyManager: {
        get: (name: string) => (name === 'volvox' ? assembly : undefined),
        waitForAssembly: () => Promise.resolve(assembly),
        isValidRefName: () => true,
      },
    }))
    .views(self => ({
      getTrackById(id: string) {
        return trackConfigs.find(t => readConfObject(t, 'trackId') === id)
      },
      // What the session-wide scan reads: every graph track, whether or not it
      // is open in a view.
      get tracks() {
        return trackConfigs
      },
      get assemblies() {
        return []
      },
      get views() {
        return self.view ? [self.view] : []
      },
      getDisplayTypeDefault(displayType: string, slot: string): unknown {
        return self.displayTypeDefaults[displayType]?.[slot]
      },
    }))
    .actions(self => ({
      setView(view: Instance<typeof LinearGenomeModel>) {
        self.view = view
        return view
      },
      addView(type: string, snapshot: Record<string, unknown>) {
        self.addedViews.push([type, snapshot])
        return snapshot
      },
      notify(message: string) {
        self.notifications.push(message)
      },
      notifyError() {},
      queueDialog() {},
    }))

  // `trackId` picks which track the display is on: 'graph_track' is the graph
  // itself, 'bubble_track' a track that can't cut a subgraph, which is how the
  // cross-track launch is exercised.
  function createDisplay({
    trackId = 'graph_track',
  }: { trackId?: string } = {}) {
    const session = Session.create({ configuration: {} }, { pluginManager })
    const view = session.setView(
      LinearGenomeModel.create({
        type: 'LinearGenomeView',
        tracks: [
          {
            type: 'FeatureTrack',
            configuration: trackId,
            displays: [{ type: 'LinearBasicDisplay' }],
          },
        ],
      }),
    )
    view.setWidth(800)
    view.setDisplayedRegions([
      { assemblyName: 'volvox', start: 0, end: 50_000, refName: 'ctgA' },
    ])

    const display = view.tracks[0]!.displays[0]!
    return { session, view, display }
  }

  return { createDisplay }
}
