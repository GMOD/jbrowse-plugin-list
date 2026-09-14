import React from 'react';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
/**
 * The route to NCBI's `nr`, which no plugin version can query directly: NCBI
 * stopped sending Access-Control-Allow-Origin to third-party origins, so the
 * browser cannot read Blast.cgi at all (see docs/blast.md).
 *
 * That makes the round trip through NCBI's own site the whole feature rather
 * than a fallback, so the panel walks it end to end. It used to hand the user a
 * link, tell them to "paste the results into JBrowse", and offer only a Close
 * button -- leaving them to find the Manual upload tab, re-pick the transcript
 * they had already chosen here, and hand-type the row name.
 */
declare const BlastManualPanel: ({ handleClose, feature, model, children, }: {
    children: React.ReactNode;
    model: AbstractTrackModel;
    feature: Feature;
    handleClose: () => void;
}) => React.JSX.Element;
export default BlastManualPanel;
