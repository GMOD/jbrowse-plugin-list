import React from 'react';
import type { AbstractTrackModel } from '@jbrowse/core/util';
export default function SubmitCancelActions({ onSubmit, onCancel, submitDisabled, submitLabel, cancelLabel, model, }: {
    onSubmit: () => void;
    onCancel: () => void;
    submitDisabled?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
    /** omitted by a panel that submits something other than a view launch */
    model?: AbstractTrackModel;
}): React.JSX.Element;
