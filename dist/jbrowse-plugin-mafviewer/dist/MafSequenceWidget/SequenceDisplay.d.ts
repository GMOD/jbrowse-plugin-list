import React from 'react';
import type { MafSequenceWidgetModel } from './stateModelFactory';
interface SequenceDisplayProps {
    model: MafSequenceWidgetModel;
    sequences: string[];
    singleLineFormat: boolean;
    includeInsertions: boolean;
    colorBackground: boolean;
    showSampleNames: boolean;
}
declare const SequenceDisplay: ({ model, sequences, colorBackground, showSampleNames, }: SequenceDisplayProps) => React.JSX.Element;
export default SequenceDisplay;
