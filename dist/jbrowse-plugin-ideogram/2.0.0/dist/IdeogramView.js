import React, { useEffect, useMemo, useRef } from 'react';
import { getSession } from '@jbrowse/core/util';
import { Grid, Link, Typography } from '@mui/material';
import Ideogram from 'ideogram';
import { observer } from 'mobx-react';
import PulseLoader from 'react-spinners/PulseLoader';
import ImportForm from './ImportForm';
import Pathways from './Pathways';
import { allChromosomes, populateAnnotations, tierLegend } from './util';
let iter = 0;
const IdeogramView = observer(({ model }) => {
    const ref = useRef(null);
    const identifier = useMemo(() => {
        iter++;
        return 'ideo-container-' + iter;
    }, []);
    const chromosomes = model.allRegions ? allChromosomes : [model.region];
    const chrHeight = model.allRegions || model.orientation === 'vertical' ? 500 : 900;
    const chrWidth = model.allRegions && model.orientation === 'vertical' ? 8 : 10;
    const showBandLabels = !model.allRegions;
    const annotations = model.ideoAnnotations && model.showAnnotations
        ? model.ideoAnnotations
        : undefined;
    const legend = model.ideoAnnotations && 'tier' in model.ideoAnnotations[0].details
        ? tierLegend
        : undefined;
    function onClickAnnot(annot) {
        const session = getSession(model);
        const target = model.widgetAnnotations.find((data) => data.name === annot.name);
        model.setSelectedAnnot(annot.name);
        // @ts-ignore
        const widget = session.addWidget('IdeogramFeatureWidget', 'ideogramFeature', {
            featureData: target,
            view: model,
        });
        // @ts-ignore
        session.showWidget(widget);
        session.setSelection(target);
    }
    const config = {
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
    };
    useEffect(() => {
        if (ref.current) {
            return new Ideogram(config);
        }
        // `config` is rebuilt on every render, so depending on it would redraw the
        // ideogram every render forever. The list below is the set of model fields
        // config is actually derived from, which is the real trigger.
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
    ]);
    useEffect(() => {
        const annotate = async () => {
            await populateAnnotations(model);
            model.setShowLoading(false);
        };
        if (!model.ideoAnnotations && !model.showImportForm) {
            annotate().catch(console.error);
        }
        // `model` is a stable MST node, so listing it would add nothing. Refetching
        // is keyed on the two fields the annotations are actually derived from.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [model.annotationsLocation, model.withReactome]);
    return (React.createElement("div", null,
        model.showImportForm && !model.isAnalysisResults ? (React.createElement(ImportForm, { model: model })) : null,
        !model.showImportForm &&
            model.showLoading &&
            !model.isAnalysisResults ? (React.createElement(Grid, { container: true, spacing: 1, justifyContent: "center", alignItems: "center", style: { paddingTop: '5px' }, direction: "column" },
            React.createElement(Typography, { variant: "body1" }, "Generating annotations"),
            React.createElement(PulseLoader, { color: "#0D233F", speedMultiplier: 0.5, size: 10 }))) : null,
        !model.showImportForm &&
            !model.showLoading &&
            !model.isAnalysisResults &&
            model.orientation === 'horizontal' ? (React.createElement(Grid, { container: true, spacing: 1, justifyContent: "center", alignItems: "center" },
            React.createElement("div", { ref: ref, id: identifier }))) : null,
        !model.showImportForm &&
            !model.showLoading &&
            !model.isAnalysisResults &&
            model.orientation === 'vertical' ? (React.createElement("div", { ref: ref, id: identifier, style: { paddingTop: '5px' } })) : null,
        model.isAnalysisResults && model.pathways ? (React.createElement(Pathways, { model: model, pathways: model.pathways })) : null,
        !model.isAnalysisResults ? (React.createElement(Typography, { variant: "caption", style: { paddingLeft: '4px', paddingBottom: '4px' } },
            "Powered by",
            ' ',
            React.createElement(Link, { href: "https://eweitz.github.io/ideogram/" }, "ideogram.js"),
            ".")) : null));
});
export default IdeogramView;
//# sourceMappingURL=IdeogramView.js.map