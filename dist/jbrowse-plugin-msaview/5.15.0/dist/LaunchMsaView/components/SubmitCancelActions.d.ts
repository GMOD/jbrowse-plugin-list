import React from 'react';
import type { MsaViewPlacement } from '../../utils/workspaces';
import type { AbstractTrackModel } from '@jbrowse/core/util';
declare const SubmitCancelActions: ({ onSubmit, onCancel, submitDisabled, hint, submitLabel, model, }: {
    /** handed the placement the box states, so no launch re-reads storage */
    onSubmit: (placement: MsaViewPlacement) => void;
    onCancel: () => void;
    submitDisabled?: boolean;
    /** why Submit is grey, shown beside it */
    hint?: React.ReactNode;
    submitLabel?: string;
    /** omitted by a panel that submits something other than a view launch */
    model?: AbstractTrackModel;
}) => React.JSX.Element;
export default SubmitCancelActions;
