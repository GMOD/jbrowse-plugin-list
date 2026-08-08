import { getSession } from '@jbrowse/core/util'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { types } from '@jbrowse/mobx-state-tree'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import TableChartIcon from '@mui/icons-material/TableChart'
import VisibilityIcon from '@mui/icons-material/Visibility'

import { AlignHorizontalLeftIcon, HourglassIcon, MaleIcon } from './Icons'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { MenuItem } from '@jbrowse/core/ui'
import type { FileLocation } from '@jbrowse/core/util/types'
import type { Instance } from '@jbrowse/mobx-state-tree'

/**
 * One pathway from Reactome's AnalysisService, narrowed to the fields the
 * pathways table and the hierarchy actually read.
 */
export interface ReactomePathway {
  stId: string
  name: string
  entities: {
    found: number
    total: number
    ratio: number
    pValue: number
    fdr: number
  }
  reactions: { found: number; total: number; ratio: number }
}

export default function IdeogramView(_pluginManager: PluginManager) {
  return types
    .model('IdeogramView', {
      type: types.literal('IdeogramView'),
      displayName: types.maybe(types.string),
      id: ElementId,

      // ideogram config
      sex: 'female',
      orientation: 'vertical',
      region: '1',
      assembly: 'hg38',
      selectedAnnot: '',
      ideogramId: '',

      // display options
      allRegions: false,
      showImportForm: true,
      showAnnotations: true,
      withReactome: false,
      showLoading: false,
      isAnalysisResults: false,

      annotationsLocation: types.optional(types.frozen(), {
        uri: '',
        locationType: 'UriLocation',
      }),

      // A model prop rather than volatile so the analysis-results view is
      // describable as data: `addView('IdeogramView', {isAnalysisResults: true,
      // pathways})` is the whole of it, with no follow-up actions, and a shared
      // session comes back with its results table populated instead of empty.
      pathways: types.frozen<ReactomePathway[] | undefined>(undefined),
    })
    // These start out undefined and the code below already checks for that, so
    // say so in the type. The `undefined as unknown as object` double-cast that
    // used to be here asserted the opposite, which made every one of those
    // checks look impossible to the compiler while doing nothing at runtime.
    .volatile(() => ({
      widgetAnnotations: undefined as object | undefined,
      ideoAnnotations: undefined as object | undefined,
      highlightedAnnots: undefined as object[] | undefined,
    }))
    .actions(self => ({
      setWidth(_n: number) {
        /* do nothing */
      },
      setDisplayName(str: string) {
        self.displayName = str
      },
      setRegion(chr: string) {
        self.region = chr.split('chr')[1] ?? chr
      },
      setAssembly(asm: string) {
        self.assembly = asm
      },
      setAllRegions(toggle: boolean) {
        self.allRegions = toggle
      },
      setOrientation(ori: string) {
        if (ori === 'horizontal') {
          self.orientation = ori
        }
        if (ori === 'vertical') {
          self.orientation = ori
        }
      },
      setShowImportForm(toggle: boolean) {
        self.showImportForm = toggle
      },
      setAnnotationsLocation(loc: FileLocation) {
        self.annotationsLocation = loc
      },
      setWidgetAnnotations(obj: any) {
        self.widgetAnnotations = obj
      },
      setIdeoAnnotations(obj: any) {
        self.ideoAnnotations = obj
      },
      setWithReactome(toggle: boolean) {
        self.withReactome = toggle
      },
      setShowLoading(toggle: boolean) {
        self.showLoading = toggle
      },
      setPathways(obj: ReactomePathway[] | undefined) {
        self.pathways = obj
      },
      setIsAnalysisResults(toggle: boolean) {
        self.isAnalysisResults = toggle
      },
      setSelectedAnnot(item: string) {
        self.selectedAnnot = item
        this.applyHighlighting()
      },
      setHighlightedAnnots(arr: any) {
        self.highlightedAnnots = arr
        this.applyHighlighting()
      },
      setIdeogramId(id: string) {
        self.ideogramId = id
      },
      applyHighlighting() {
        // @ts-ignore
        self.ideoAnnotations.filter((annot: any) => {
          if (self.highlightedAnnots?.includes(annot.name)) {
            annot.color = '#FFC20A'
          }
          if (self.selectedAnnot === annot.name) {
            annot.color = '#000000'
          }
          if (
            !self.highlightedAnnots?.includes(annot.name) &&
            self.selectedAnnot !== annot.name
          ) {
            annot.color = annot.prevColor
          }
        })
      },
      toggleAllRegions(toggle: boolean) {
        if (!toggle) {
          this.setOrientation('horizontal')
        }
        this.setAllRegions(toggle)
      },
      toggleOrientation() {
        if (self.orientation === 'horizontal') {
          this.setOrientation('vertical')
        } else {
          this.setOrientation('horizontal')
        }
      },
      toggleSex() {
        if (self.sex === 'male') {
          self.sex = 'female'
        } else {
          self.sex = 'male'
        }
      },
      toggleAnnotations() {
        self.showAnnotations = !self.showAnnotations
      },
      refreshTable() {
        const session = getSession(self)
        const isActive = session.views.some(
          (view: any) => view?.isAnalysisResults,
        )
        if (!isActive) {
          // The view is described by its initial snapshot rather than built
          // empty and then driven through four setters. Nothing reads the
          // return value, so this needs neither a cast nor the ts-ignore per
          // call that reaching back through session.views[length - 1] did.
          session.addView('IdeogramView', {
            displayName: 'Reactome Analysis Results',
            isAnalysisResults: true,
            ideogramId: self.ideogramId,
            pathways: self.pathways,
          })
        } else {
          session.notify(
            'The analysis results table is already displayed.',
            'info',
          )
        }
      },
    }))
    .views(self => ({
      menuItems(): MenuItem[] {
        const menuItems: MenuItem[] = [
          {
            label: 'Return to import form',
            icon: FolderOpenIcon,
            disabled: self.isAnalysisResults,
            onClick: () => { self.setShowImportForm(true) },
          },
          {
            label: 'Show all regions in assembly',
            icon: VisibilityIcon,
            type: 'checkbox',
            checked: self.allRegions,
            disabled:
              self.isAnalysisResults || self.showImportForm,
            onClick: () => { self.toggleAllRegions(!self.allRegions) },
          },
          {
            label: 'Horizontal Display',
            icon: AlignHorizontalLeftIcon,
            type: 'checkbox',
            disabled:
              (!self.allRegions && self.isAnalysisResults) ||
              self.showImportForm,
            checked: self.orientation === 'horizontal',
            onClick: () => { self.toggleOrientation() },
          },
          {
            label: 'Male Genome',
            icon: MaleIcon,
            type: 'checkbox',
            checked: self.sex === 'male',
            disabled:
              self.isAnalysisResults || self.showImportForm,
            onClick: () => { self.toggleSex() },
          },
          {
            label: 'Show annotations',
            icon: HourglassIcon,
            type: 'checkbox',
            checked:
              self.showAnnotations &&
              self.ideoAnnotations !== undefined,
            disabled:
              (self.widgetAnnotations === undefined &&
                self.isAnalysisResults) ||
              self.showImportForm ||
              self.ideoAnnotations === undefined,
            onClick: () => { self.toggleAnnotations() },
          },
          {
            label: 'Refresh Analysis Results Table',
            icon: TableChartIcon,
            disabled:
              self.isAnalysisResults ||
              self.showImportForm ||
              !self.withReactome,
            onClick: () => { self.refreshTable() },
          },
        ]
        return menuItems
      },
    }))
}

export type IdeogramViewStateModel = ReturnType<typeof IdeogramView>
// interface, not `type X = Instance<…>`: the alias form makes the factory's
// inferred type self-referential the moment anything the model reaches back
// mentions the model, which surfaces as TS7023 on the factory and TS2456 here.
// The interface defers the reference. ADR-055 in jbrowse-components.
export interface IdeogramViewModel extends Instance<IdeogramViewStateModel> {}
