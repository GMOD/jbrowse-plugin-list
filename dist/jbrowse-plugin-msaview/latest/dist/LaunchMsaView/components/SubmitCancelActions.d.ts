import React from 'react';
export default function SubmitCancelActions({ onSubmit, onCancel, submitDisabled, submitLabel, cancelLabel, }: {
    onSubmit: () => void;
    onCancel: () => void;
    submitDisabled?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
}): React.JSX.Element;
