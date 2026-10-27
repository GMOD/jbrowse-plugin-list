import PluginManager from '@jbrowse/core/PluginManager'
import {
  ConfigurationReference,
  ConfigurationSchema,
  readConfObject,
} from '@jbrowse/core/configuration'
import { BaseDisplay } from '@jbrowse/core/pluggableElementTypes'
import DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import { types } from '@jbrowse/mobx-state-tree'
import { linearGenomeViewStateModelFactory } from '@jbrowse/plugin-linear-genome-view'
import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import PanSNAliasesF from './index'
import {
  withCanonicalAssemblyNames,
  withPanSNAliases,
} from './trackAdapterConfig'
import Adapter from '../GbzBaseSyntenyAdapter/GbzBaseSyntenyAdapter'
import configSchema from '../GbzBaseSyntenyAdapter/configSchema'
import GbzBaseSyntenyAdapterF from '../GbzBaseSyntenyAdapter/index'
import GraphTrackF from '../GraphTrack/index'
import WalkAdapter from '../WalkTabixSyntenyAdapter/WalkTabixSyntenyAdapter'
import walkConfigSchema from '../WalkTabixSyntenyAdapter/configSchema'
import WalkTabixSyntenyAdapterF from '../WalkTabixSyntenyAdapter/index'

import type { AssemblyAliases } from './trackAdapterConfig'
import type { SyntenyMate } from '@jbrowse/synteny-core'

const GBZ = { type: 'GbzBaseSyntenyAdapter', assemblyNames: ['hg38'] }

const HG00621_1 = { name: 'HG00621.1', aliases: ['HG00621#1'] }

const HG38 = { name: 'hg38', aliases: ['GRCh38'] }

const local = (path: string) => ({
  localPath: require.resolve(path),
  locationType: 'LocalPathLocation' as const,
})

describe('the map a track sends', () => {
  test('an assembly aliased by its PanSN haplotype name maps to it', () => {
    expect(
      withPanSNAliases(GBZ, [{ name: 'hg38', aliases: ['GRCh38'] }, HG00621_1])
        .assemblyNameToPanSN,
    ).toEqual({ 'HG00621.1': 'HG00621#1' })
  })

  test('a bare sample, a contig name or a non-numeric haplotype is not read', () => {
    const config = withPanSNAliases(GBZ, [
      { name: 'hg38', aliases: ['GRCh38', 'hg38.p14'] },
      { name: 'HG002.1', aliases: ['HG002#1#chr6'] },
      { name: 'odd', aliases: ['odd#a', '#1', 'odd#'] },
    ])
    expect(config).toBe(GBZ)
  })

  test("the config's own entry wins for its assembly and for its prefix", () => {
    const config = withPanSNAliases(
      { ...GBZ, assemblyNameToPanSN: { hg38: 'GRCh38#0', mine: 'HG00621#1' } },
      [
        HG00621_1,
        { name: 'mine', aliases: ['HG00621#2'] },
        { name: 'HG00438.1', aliases: ['HG00438#1'] },
      ],
    )
    expect(config.assemblyNameToPanSN).toEqual({
      hg38: 'GRCh38#0',
      mine: 'HG00621#1',
      'HG00438.1': 'HG00438#1',
    })
  })

  test('an assembly with no PanSN alias leaves the config as it was', () => {
    const config = { ...GBZ, assemblyNameToPanSN: { hg38: 'GRCh38#0' } }
    expect(withPanSNAliases(config, [{ name: 'HG00621.1', aliases: [] }])).toBe(
      config,
    )
  })
})

describe('the assembly names a track sends', () => {
  test('an alias becomes the canonical name and stays its PanSN prefix', () => {
    expect(
      withCanonicalAssemblyNames({ ...GBZ, assemblyNames: ['GRCh38'] }, [
        HG38,
        HG00621_1,
      ]),
    ).toEqual({
      ...GBZ,
      assemblyNames: ['hg38'],
      assemblyNameToPanSN: { hg38: 'GRCh38' },
    })
  })

  test("a map entry under an alias moves to the canonical name, and the canonical name's own entry wins", () => {
    const named = (assemblyNameToPanSN: Record<string, string>) =>
      withCanonicalAssemblyNames(
        { ...GBZ, assemblyNames: ['GRCh38', 'HG00621#1'], assemblyNameToPanSN },
        [HG38, HG00621_1],
      )
    expect(named({ GRCh38: 'GRCh38#0' })).toEqual({
      ...GBZ,
      assemblyNames: ['hg38', 'HG00621.1'],
      assemblyNameToPanSN: { hg38: 'GRCh38#0', 'HG00621.1': 'HG00621#1' },
    })
    expect(
      named({ GRCh38: 'GRCh38#1', hg38: 'GRCh38#0' }).assemblyNameToPanSN,
    ).toEqual({ hg38: 'GRCh38#0', 'HG00621.1': 'HG00621#1' })
  })

  test('canonical names leave the config as it was', () => {
    expect(withCanonicalAssemblyNames(GBZ, [HG38, HG00621_1])).toBe(GBZ)
  })
})

describe("a lanes track anchored on an alias of the window's assembly", () => {
  test('the walk adapter lists, cuts and reads the window', async () => {
    const adapter = new WalkAdapter(
      walkConfigSchema.create(
        withCanonicalAssemblyNames(
          {
            type: 'WalkTabixSyntenyAdapter',
            walksLocation: local(
              '../RgfaTabixAdapter/test_data/walks5_header.GRCh38.walks.bed.gz',
            ),
            walksIndex: {
              location: local(
                '../RgfaTabixAdapter/test_data/walks5_header.GRCh38.walks.bed.gz.tbi',
              ),
            },
            assemblyNames: ['GRCh38'],
          },
          [HG38],
        ),
      ),
    )
    const window = {
      refName: 'chr1',
      assemblyName: 'hg38',
      start: 0,
      end: 3600,
    }
    expect(await adapter.getRefNames({ assemblyName: 'hg38' })).toContain(
      'chr1',
    )
    expect(await adapter.getSubgraph(window)).toBeTruthy()
    const features = await firstValueFrom(
      adapter.getFeatures(window).pipe(toArray()),
    )
    expect(features.length).toBeGreaterThan(0)
  })

  test('the gbz adapter lists, cuts and reads the window', async () => {
    const adapter = new Adapter(
      configSchema.create(
        withCanonicalAssemblyNames(
          {
            ...GBZ,
            gbzDbLocation: local(
              '../GbzBaseSyntenyAdapter/test_data/micb-kir3dl1.gbz.db',
            ),
            haplotypeIndexLocation: local(
              '../GbzBaseSyntenyAdapter/test_data/micb-kir3dl1.sampled.haplotype-index.db',
            ),
            assemblyNames: ['GRCh38'],
            assemblyNameToPanSN: { GRCh38: 'GRCh38#0' },
            context: 0,
          },
          [HG38],
        ),
      ),
    )
    const window = {
      refName: 'chr6',
      start: 31500000,
      end: 31501000,
      assemblyName: 'hg38',
    }
    expect(await adapter.getRefNames({ assemblyName: 'hg38' })).toContain(
      'chr6',
    )
    expect(await adapter.getSubgraph(window)).toBeTruthy()
    const features = await firstValueFrom(
      adapter.getFeatures(window).pipe(toArray()),
    )
    expect(features.length).toBeGreaterThan(0)
  })
})

describe('the lanes the adapter reads with that map', () => {
  // micb-kir3dl1.gbz.db is gbwt-rs's 46-sample HPRC slice; see
  // GbzBaseSyntenyAdapter.test.ts
  const window = {
    refName: 'chr6',
    start: 31500000,
    end: 31501000,
    assemblyName: 'hg38',
  }

  function lanesAdapter(
    assemblies: AssemblyAliases[],
    assemblyNameToPanSN: Record<string, string> = {},
  ) {
    return new Adapter(
      configSchema.create(
        withPanSNAliases(
          {
            ...GBZ,
            gbzDbLocation: {
              localPath:
                require.resolve('../GbzBaseSyntenyAdapter/test_data/micb-kir3dl1.gbz.db'),
              locationType: 'LocalPathLocation',
            },
            haplotypeIndexLocation: {
              localPath:
                require.resolve('../GbzBaseSyntenyAdapter/test_data/micb-kir3dl1.sampled.haplotype-index.db'),
              locationType: 'LocalPathLocation',
            },
            assemblyNameToPanSN,
            context: 0,
          },
          assemblies,
        ),
      ),
    )
  }

  const mates = async (adapter: Adapter, opts: Record<string, unknown> = {}) =>
    new Set(
      (
        await firstValueFrom(
          adapter.getFeatures(window, opts as never).pipe(toArray()),
        )
      ).map(f => (f.get('mate') as SyntenyMate).assemblyName),
    )

  const laneNamed = async (adapter: Adapter, label: string) =>
    (await adapter.getHeader()).lanes.find(l => l.label === label)?.name

  test('an alias alone names the lane, reads its contigs and narrows a fetch to it', async () => {
    const adapter = lanesAdapter([HG00621_1])
    expect(await laneNamed(adapter, 'HG00621#1')).toBe('HG00621.1')
    expect(await laneNamed(adapter, 'HG00621#2')).toBe('HG00621#2')
    const all = await mates(adapter)
    expect(all.has('HG00621.1')).toBe(true)
    expect(all.has('HG00621#1')).toBe(false)
    expect(
      await adapter.getRefNames({ assemblyName: 'HG00621.1' }),
    ).not.toEqual([])
    expect(await mates(adapter, { haplotypes: ['HG00621.1'] })).toEqual(
      new Set(['HG00621.1']),
    )
  })

  test('an assemblyNameToPanSN entry overrides the alias', async () => {
    const adapter = lanesAdapter([HG00621_1], { 'HG00621.1': 'HG00621#2' })
    expect(await laneNamed(adapter, 'HG00621#2')).toBe('HG00621.1')
    expect(await laneNamed(adapter, 'HG00621#1')).toBe('HG00621#1')
  })

  test('an assembly with neither keeps its lane at the PanSN prefix', async () => {
    const adapter = lanesAdapter([{ name: 'HG00621.1', aliases: [] }])
    expect(await laneNamed(adapter, 'HG00621#1')).toBe('HG00621#1')
    expect(await adapter.getRefNames({ assemblyName: 'HG00621.1' })).toEqual([])
  })
})

// Core's display stood in for by BaseDisplay, which is where its
// `adapterConfig` comes from
test.each(['GbzBaseSyntenyAdapter', 'WalkTabixSyntenyAdapter'])(
  "a core synteny display under a %s lanes track hands its requests the session's names and aliases",
  type => {
    const pluginManager = new PluginManager()
    GbzBaseSyntenyAdapterF(pluginManager)
    WalkTabixSyntenyAdapterF(pluginManager)
    pluginManager.addDisplayType(() => {
      const displaySchema = ConfigurationSchema(
        'MultiWaySyntenyDisplay',
        {},
        { explicitlyTyped: true, explicitIdentifier: 'displayId' },
      )
      return new DisplayType({
        name: 'MultiWaySyntenyDisplay',
        configSchema: displaySchema,
        stateModel: types.compose(
          'MultiWaySyntenyDisplay',
          BaseDisplay,
          types.model({
            type: types.literal('MultiWaySyntenyDisplay'),
            configuration: ConfigurationReference(displaySchema),
          }),
        ),
        trackType: 'GraphTrack',
        viewType: 'LinearGenomeView',
        ReactComponent: () => null,
      })
    })
    GraphTrackF(pluginManager)
    PanSNAliasesF(pluginManager)
    pluginManager.addViewType(
      () =>
        new ViewType({
          name: 'LinearGenomeView',
          stateModel: linearGenomeViewStateModelFactory(pluginManager),
          ReactComponent: () => null,
        }),
    )
    pluginManager.createPluggableElements()
    pluginManager.configure()

    const track = pluginManager.pluggableConfigSchemaType('track').create(
      {
        type: 'GraphTrack',
        trackId: 'lanes',
        name: 'lanes',
        assemblyNames: ['hg38', 'HG00621.1'],
        adapter: {
          type,
          assemblyNames: ['GRCh38'],
          assemblyNameToPanSN: { hg38: 'GRCh38#0' },
        },
        displays: [
          { type: 'MultiWaySyntenyDisplay', displayId: 'lanes-multiway' },
        ],
      },
      { pluginManager },
    )
    const LinearGenomeView =
      pluginManager.getViewType('LinearGenomeView').stateModel
    const Session = types
      .model({
        view: LinearGenomeView,
        configuration: types.map(types.frozen()),
      })
      .volatile(() => ({
        rpcManager: {},
        assemblyManager: {
          assemblyList: [{ name: 'hg38', aliases: ['GRCh38'] }, HG00621_1],
          get: () => undefined,
          has: () => true,
          isValidRefName: () => true,
        },
      }))
      .views(() => ({
        get tracks() {
          return [track]
        },
        getTrackById(id: string) {
          return readConfObject(track, 'trackId') === id ? track : undefined
        },
        getDisplayTypeDefault(): unknown {
          return undefined
        },
      }))
    const session = Session.create(
      {
        view: { type: 'LinearGenomeView', tracks: [] },
        configuration: {},
      },
      { pluginManager },
    )
    session.view.showTrack('lanes')
    const display = session.view.tracks[0]!.displays[0]!
    expect(display.type).toBe('MultiWaySyntenyDisplay')
    expect(display.adapterConfig.assemblyNames).toEqual(['hg38'])
    expect(display.adapterConfig.assemblyNameToPanSN).toEqual({
      'HG00621.1': 'HG00621#1',
      hg38: 'GRCh38#0',
    })
  },
)
