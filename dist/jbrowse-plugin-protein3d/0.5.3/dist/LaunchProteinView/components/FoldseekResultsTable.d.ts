import React from 'react';
import type { FoldseekResult } from '../services/foldseekApi';
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export default function FoldseekResultsTable({ results, session, view, feature, selectedTranscript, userProvidedTranscriptSequence, onClose, }: {
    results: FoldseekResult;
    session: AbstractSessionModel;
    view: LinearGenomeViewModel;
    feature: Feature;
    selectedTranscript?: Feature;
    userProvidedTranscriptSequence?: string;
    onClose: () => void;
}): React.JSX.Element;
