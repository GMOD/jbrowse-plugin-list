import { getSession, parseLocString } from '@jbrowse/core/util'
// Straight from mobx, which is what @jbrowse/core/util re-exported anyway. That
// re-export is gone in JBrowse v5, and because plugins resolve these names off
// the host's JBrowseExports at runtime, importing it from core made the
// published bundle read `undefined` on a v5 host. mobx is externalized too, so
// this costs nothing and works on v4 and v5 alike.
import { when } from 'mobx'


import { generateAnnotations } from './AnnotationsAdapter'

import type { IdeogramViewModel } from './model'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export const regions = [
  'chr1',
  'chr2',
  'chr3',
  'chr4',
  'chr5',
  'chr6',
  'chr7',
  'chr8',
  'chr9',
  'chr10',
  'chr11',
  'chr12',
  'chr13',
  'chr14',
  'chr15',
  'chr16',
  'chr17',
  'chr18',
  'chr19',
  'chr20',
  'chr21',
  'chr22',
  'chrX',
  'chrY',
]

export const allChromosomes = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  'X',
  'Y',
]

export const tierLegend = [
  {
    name: 'Tier 1',
    rows: [
      { name: '', color: '#0000FF', shape: 'triangle' },
      { name: 'Tier 2', color: '#FF0000', shape: 'triangle' },
    ],
  },
]

export async function openReactomeView(
  pwId: string,
  pathways: any,
  pwName: string,
  geneName: string,
  model: IdeogramViewModel,
) {
  const session = getSession(model)
  const rv = session.views.find(view => view.type === 'ReactomeView') as any

  if (rv) {
    rv.setPathways(pathways)
    rv.setSelectedPathway(pwId)
    rv.setGene(geneName)
    rv.setMessage(
      `Pathways relating to ${geneName} are being displayed. "${pwName}" has been selected.`,
    )
  } else {
    const view = session.addView('ReactomeView', {
      displayName: 'Reactome View',
    }) as any
    view.setPathways(pathways)
    view.setSelectedPathway(pwId)
    view.setGene(geneName)
    view.setMessage(
      `Pathways relating to ${geneName} are being displayed. "${pwName}" has been selected.`,
    )
    await when(() => view.initialized)
  }
}

export async function navToAnnotation(
  locString: string,
  model: IdeogramViewModel,
) {
  // @ts-ignore
  const { assembly } = model.view
  const session = getSession(model)
  const lgv = session.views.find(
    view =>
      view.type === 'LinearGenomeView' &&
      // @ts-ignore
      view.assemblyNames[0] === assembly,
  ) as any

  if (lgv) {
    lgv.navToLocString(locString)
  } else {
    const session = getSession(model)
    const { assemblyManager } = session
    const sessionAssembly = await assemblyManager.waitForAssembly(assembly)
    if (sessionAssembly) {
      try {
        const loc = parseLocString(locString, refName =>
          session.assemblyManager.isValidRefName(refName, assembly),
        )
        const { refName } = loc
        const { regions } = sessionAssembly
        const canonicalRefName = sessionAssembly.getCanonicalRefName(refName)

        let newDisplayedRegion
        if (regions) {
          newDisplayedRegion = regions.find(
            (region: any) => region.refName === canonicalRefName,
          )
        }

        const view = session.addView('LinearGenomeView', {
          displayName: assembly,
        }) as LinearGenomeViewModel
        await when(() => view.initialized)

        view.setDisplayedRegions([
          JSON.parse(JSON.stringify(newDisplayedRegion)),
        ])
        await view.navToLocString(locString)
      } catch (e) {
        session.notify(`${e}`, 'error')
      }
    }
  }
}

export async function populateAnnotations(model: any) {
  const session = getSession(model)

  if (model.annotationsLocation) {
    model.setShowLoading(true)
    const { widget, ideo, pathways, res } = await generateAnnotations(
      model.annotationsLocation,
      model.withReactome,
    )

    if (res.type !== 2) {
      model.setWidgetAnnotations(widget)
      model.setIdeoAnnotations(ideo)
    }

    if (model.withReactome) {
      const tview = session.views.find(
        (view: any) =>
          view?.isAnalysisResults && view.ideogramId === model.ideogramId,
      )
      if (tview) {
        session.removeView(tview)
      }
      // Described by its initial snapshot rather than built empty and then
      // driven through four setters, which is also what removes the ts-ignore
      // each of those calls needed.
      session.addView('IdeogramView', {
        displayName: 'Reactome Analysis Results',
        isAnalysisResults: true,
        ideogramId: model.ideogramId,
        pathways,
      })
      model.setPathways(pathways)
    }

    if (!res.success) {
      session.notify(res.message, 'warning')
    }
  }
}
