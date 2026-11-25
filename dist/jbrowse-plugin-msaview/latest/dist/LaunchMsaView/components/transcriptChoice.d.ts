import React from 'react';
import { useFeatureSequence } from './useFeatureSequence';
import type { Feature } from '@jbrowse/core/util';
type PickState = [
    string | undefined,
    React.Dispatch<React.SetStateAction<string | undefined>>
];
interface TranscriptChoice {
    pick: PickState;
    sequenceFor: string;
    sequence: ReturnType<typeof useFeatureSequence>;
}
export declare const TranscriptChoiceContext: React.Context<TranscriptChoice | undefined>;
export declare function defaultTranscriptId(options: Feature[], preferredTranscriptId: string | undefined): string;
export declare const TranscriptChoiceProvider: ({ feature, view, preferredTranscriptId, children, }: {
    feature: Feature;
    view: {
        assemblyNames?: string[];
    } | undefined;
    preferredTranscriptId?: string;
    children: React.ReactNode;
}) => React.JSX.Element;
export {};
