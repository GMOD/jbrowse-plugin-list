import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes'
import { getSession } from '@jbrowse/core/util'
import { addDisposer, types } from '@jbrowse/mobx-state-tree'
import { autorun } from 'mobx'
import { MSAModelF } from 'react-msaview'

import { buildColumnToRefPos, renderedColToMsaCol } from './coords'
import { initRegion, initSources } from './init'
import { fetchTviewPlan } from '../LaunchTView/fetchTviewPlan'
import { MAX_CELLS } from '../LaunchTView/limits'

import type { TviewInit } from './init'
import type { FetchRegion, TviewSource } from '../LaunchTView/fetchTviewPlan'
import type { MenuItem } from '@jbrowse/core/ui'
import type { Instance } from '@jbrowse/mobx-state-tree'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// re-exported so the inferred (composed) state-model type can name mobx's
// IKeyValueMap when emitting declarations (avoids TS2883 portability error)
export type { IKeyValueMap } from 'mobx'

type MaybeLGV = LinearGenomeViewModel | undefined

export interface IRegion {
  refName: string
  start: number
  end: number
}

export type { TviewInit } from './init'

/**
 * #stateModel TViewPlugin
 * extends
 * - MSAModel from https://github.com/GMOD/react-msaview
 */
export default function stateModelFactory() {
  return types
    .compose(
      'TView',
      BaseViewModel,
      MSAModelF(),
      types.model({
        type: types.literal('TView'),
        /**
         * #property
         * LGV this pileup was launched from; drives highlights and click-to-nav
         */
        connectedViewId: types.maybe(types.string),
        /**
         * #property
         * what the view is: a locus, an assembly and the alignment files to
         * read it from. Everything else here is derived from it — see
         * `./init.ts` for why this one is kept rather than cleared
         */
        init: types.frozen<TviewInit | undefined>(),
        /**
         * #property
         * reference region the alignment columns span, filled in by the load
         */
        msaRegion: types.frozen<IRegion | undefined>(),
        /**
         * #property
         * [refPos, width] for every position where some read has an insertion
         */
        insertionWidths: types.frozen<[number, number][]>([]),
        /**
         * #property
         * [start, end, columns] for every tandem array laid out per copy
         */
        arraySpans: types.frozen<[number, number, number][]>([]),
        /**
         * #property
         */
        zoomToBaseLevel: types.optional(types.boolean, false),
      }),
    )
    .views(self => ({
      /**
       * #getter
       */
      get columnToRefPos() {
        const { msaRegion, insertionWidths, arraySpans } = self
        return msaRegion
          ? buildColumnToRefPos({ ...msaRegion, insertionWidths, arraySpans })
          : undefined
      },
      /**
       * #getter
       */
      get connectedView() {
        const { views } = getSession(self)
        return views.find(f => f.id === self.connectedViewId) as MaybeLGV
      },
      /**
       * #getter
       * the region `init.loc` names, once the assembly can parse it
       */
      get initRegion() {
        return self.init ? initRegion(getSession(self), self.init) : undefined
      },
      /**
       * #getter
       * the alignment files `init.tracks` names, once every one resolves. The
       * configs are read rather than the track models, so a tview outlives the
       * tracks it was launched from being closed.
       */
      get initSources() {
        return self.init ? initSources(getSession(self), self.init) : undefined
      },
    }))
    .views(self => ({
      /**
       * #method
       */
      colToGenomeRegion(col: number): IRegion | undefined {
        const { columnToRefPos, msaRegion, blanks } = self
        const pos = columnToRefPos?.[renderedColToMsaCol(blanks, col)]
        return msaRegion && pos !== undefined
          ? { refName: msaRegion.refName, start: pos, end: pos + 1 }
          : undefined
      },
    }))
    .views(self => ({
      /**
       * #getter
       * regions the connected LGV highlights: the hovered column plus the
       * sticky clicked column
       */
      get connectedHighlights() {
        const { mouseCol, mouseClickCol } = self
        const regions = [mouseCol, mouseClickCol]
          .filter((col): col is number => col !== undefined)
          .map(col => self.colToGenomeRegion(col))
          .filter((r): r is IRegion => r !== undefined)
        // an insertion column and its reference column resolve to the same
        // position, so deduping by column would still stack two identical bands
        return [
          ...new Map(regions.map(r => [`${r.refName}:${r.start}`, r])).values(),
        ]
      },
    }))
    .volatile(() => ({
      /** a load is in flight, or has failed and should not be retried */
      loading: false,
      loadFailed: false,
    }))
    .actions(self => ({
      /**
       * #action
       */
      setLoading(arg: boolean) {
        self.loading = arg
      },
      /**
       * #action
       */
      setLoadFailed(arg: boolean) {
        self.loadFailed = arg
      },
      /**
       * #action
       */
      setInit(arg?: TviewInit) {
        self.init = arg
        self.loadFailed = false
      },
      /**
       * #action
       */
      setMsaData(result: {
        msa: string
        tree?: string
        insertionWidths: [number, number][]
        arraySpans: [number, number, number][]
        region: IRegion
      }) {
        self.msaRegion = result.region
        self.insertionWidths = result.insertionWidths
        self.arraySpans = result.arraySpans
        self.data.setMSA(result.msa)
        if (result.tree) {
          self.data.setTree(result.tree)
        }
      },
      /**
       * #action
       */
      setZoomToBaseLevel(arg: boolean) {
        self.zoomToBaseLevel = arg
      },
      /**
       * #action
       */
      navToColumn(col: number) {
        const { connectedView, zoomToBaseLevel } = self
        const r = self.colToGenomeRegion(col)
        if (r && connectedView) {
          if (zoomToBaseLevel) {
            connectedView.navTo(r)
          } else {
            connectedView.centerAt(r.start, r.refName)
          }
        }
      },
    }))
    .actions(self => ({
      /**
       * #action
       * builds the alignment `init` describes, from whatever `init` describes
       * it over. The one way an alignment ever gets here.
       */
      async load(region: FetchRegion, sources: TviewSource[]) {
        const session = getSession(self)
        self.setLoading(true)
        self.setLoadingMSA(true)
        self.setStatus({ msg: 'Building alignment from track data' })
        try {
          const result = await fetchTviewPlan({ session, sources, region })
          if (result.tooLarge) {
            throw new Error(
              `alignment is ${result.cellCount.toLocaleString('en-US')} cells, above the ${MAX_CELLS.toLocaleString('en-US')} limit`,
            )
          }
          self.setMsaData(result)
        } catch (e) {
          console.error(e)
          self.setLoadFailed(true)
          session.notify(`Could not build tview alignment: ${e}`, 'error')
        } finally {
          self.setLoadingMSA(false)
          self.setStatus(undefined)
          self.setLoading(false)
        }
      },
    }))
    .actions(self => ({
      afterCreate() {
        addDisposer(
          self,
          autorun(() => {
            // Everything that decides whether to load is a getter over `init`,
            // so this reads as the one sentence it is: an alignment the view
            // does not have, over a region and files it can now resolve. It
            // stays armed across the assembly loading and the track configs
            // arriving, which is what a restored session needs and what a
            // session-authored view needs, without either being a special case.
            const { data, initRegion, initSources, loading, loadFailed } = self
            if (
              !data.msa &&
              initRegion &&
              initSources &&
              !loading &&
              !loadFailed
            ) {
              // load handles its own failures, so it never rejects
              void self.load(initRegion, initSources)
            }
          }),
        )
      },
    }))
    .actions(self => {
      const superSetMouseClickPos = self.setMouseClickPos.bind(self)
      return {
        /**
         * #action
         */
        setMouseClickPos(col?: number, row?: number) {
          superSetMouseClickPos(col, row)
          if (col !== undefined) {
            self.navToColumn(col)
          }
        },
      }
    })
    .views(self => {
      // react-msaview's extraViewMenuItems() has no caller, in that package or
      // in JBrowse; the view hamburger renders menuItems(), so extend that
      const superMenuItems = self.menuItems.bind(self)
      return {
        /**
         * #method
         * overrides base
         */
        menuItems(): MenuItem[] {
          return [
            ...superMenuItems(),
            {
              label: 'Zoom to base level on click?',
              type: 'checkbox',
              checked: self.zoomToBaseLevel,
              onClick: () => {
                self.setZoomToBaseLevel(!self.zoomToBaseLevel)
              },
            },
          ]
        },
      }
    })
}

export type JBrowsePluginTViewStateModel = ReturnType<typeof stateModelFactory>
export type JBrowsePluginTViewModel = Instance<JBrowsePluginTViewStateModel>

export function isTView(view: {
  type: string
}): view is JBrowsePluginTViewModel {
  return view.type === 'TView'
}
