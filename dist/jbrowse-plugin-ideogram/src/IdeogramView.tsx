import React, { useEffect, useRef, useMemo } from 'react'
import { observer } from 'mobx-react'
import Ideogram from 'ideogram'
import ImportForm from './ImportForm'
import { allChromosomes, tierLegend, populateAnnotations } from './util'
import { Grid, Typography, Link } from '@material-ui/core'
import { getSession } from '@jbrowse/core/util'
import PulseLoader from 'react-spinners/PulseLoader'
import Pathways from './Pathways'

let iter = 0
const IdeogramView = observer(({ model }: { model: any }) => {
  const ref = useRef<HTMLDivElement>(null)
  const identifier = useMemo(() => {
    iter++
    return 'ideo-container-' + iter
  }, [])

  const chromosomes = model.allRegions ? allChromosomes : [model.region]
  const chrHeight =
    model.allRegions || model.orientation === 'vertical' ? 500 : 900
  const chrWidth = model.allRegions && model.orientation === 'vertical' ? 8 : 10
  const showBandLabels = !model.allRegions
  const annotations =
    model.ideoAnnotations && model.showAnnotations
      ? model.ideoAnnotations
      : undefined

  const legend =
    model.ideoAnnotations && 'tier' in model.ideoAnnotations[0].details
      ? tierLegend
      : undefined

  function onClickAnnot(annot: any) {
    const session = getSession(model)
    const target = model.widgetAnnotations.filter(function(data: any) {
      return data.name === annot.name
    })[0]

    model.setSelectedAnnot(annot.name)

    if (session) {
      // @ts-ignore
      const widget = session.addWidget(
        'IdeogramFeatureWidget',
        'ideogramFeature',
        {
          featureData: target,
          view: model,
        },
      )
      // @ts-ignore
      session.showWidget(widget)
      session.setSelection(target)
    }
  }

  var config = {
    organism: 'human',
    sex: model.sex,
    chrHeight,
    chrWidth,
    chromosomes,
    showBandLabels,
    rotatable: false,
    orientation: model.orientation,
    container: '#' + identifier,
    annotations,
    legend,
    onClickAnnot,
  }

  useEffect(() => {
    if (ref.current) {
      return new Ideogram(config)
    }
  }, [
    model.sex,
    model.orientation,
    model.pliody,
    model.showImportForm,
    model.allRegions,
    model.region,
    model.showAnnotations,
    model.showLoading,
    model.isAnalysisResults,
    model.selectedAnnot,
    model.highlightedAnnots,
  ])

  useEffect(() => {
    const annotate = async () => {
      await populateAnnotations(model)
      model.setShowLoading(false)
    }
    if (!model.ideoAnnotations && !model.showImportForm) {
      annotate().catch(console.error)
    }
  }, [model.annotationsLocation, model.withReactome])

  return (
    <div>
      {model.showImportForm && !model.isAnalysisResults ? (
        <ImportForm model={model} />
      ) : null}
      {!model.showImportForm &&
      model.showLoading &&
      !model.isAnalysisResults ? (
        <Grid
          container
          spacing={1}
          justifyContent="center"
          alignItems="center"
          style={{ paddingTop: '5px' }}
          direction="column"
        >
          <Typography variant="body1">Generating annotations</Typography>
          <PulseLoader color="#0D233F" speedMultiplier={0.5} size={10} />
        </Grid>
      ) : null}
      {!model.showImportForm &&
      !model.showLoading &&
      !model.isAnalysisResults &&
      model.orientation === 'horizontal' ? (
        <Grid container spacing={1} justifyContent="center" alignItems="center">
          <div ref={ref} id={identifier}></div>
        </Grid>
      ) : null}
      {!model.showImportForm &&
      !model.showLoading &&
      !model.isAnalysisResults &&
      model.orientation === 'vertical' ? (
        <div ref={ref} id={identifier} style={{ paddingTop: '5px' }}></div>
      ) : null}
      {model.isAnalysisResults && model.pathways ? (
        <Pathways model={model} pathways={model.pathways} />
      ) : null}
      {!model.isAnalysisResults ? (
        <Typography
          variant="caption"
          style={{ paddingLeft: '4px', paddingBottom: '4px' }}
        >
          Powered by{' '}
          <Link href="https://eweitz.github.io/ideogram/">ideogram.js</Link>.
        </Typography>
      ) : null}
    </div>
  )
})

export default IdeogramView
