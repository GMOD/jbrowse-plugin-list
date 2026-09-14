import React from 'react';
import type { FoldseekAlignment } from '../services/foldseekApi';
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export interface FlattenedHit extends FoldseekAlignment {
    db: string;
    structureUrl?: string;
}
export default function FoldseekActionMenu({ hit, session, view, feature, selectedTranscript, userProvidedTranscriptSequence, onClose, }: {
    hit: FlattenedHit;
    session: AbstractSessionModel;
    view: LinearGenomeViewModel;
    feature: Feature;
    selectedTranscript?: Feature;
    userProvidedTranscriptSequence?: string;
    onClose: () => void;
}): React.JSX.Element;
