import React from 'react';
import { ErrorMessage, LoadingEllipses, ResizeHandle } from '@jbrowse/core/ui';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { observer } from 'mobx-react';
import ManualAlignmentDialog from './ManualAlignmentDialog';
import ProteinViewHeader from './ProteinViewHeader';
import useProteinView from '../useProteinView';
const ProteinView = observer(function ProteinView({ model, }) {
    const { showControls } = model;
    const { parentRef, error, loading } = useProteinView({
        showControls,
        model,
    });
    if (error) {
        return React.createElement(ErrorMessage, { error: error });
    }
    return (React.createElement(ProteinViewContainer, { model: model, parentRef: parentRef, loading: loading }));
});
// A failed superposition or recolor is worth reporting, not worth wearing for
// the rest of the session, so the message can be dismissed.
const DismissableError = observer(function DismissableError({ model, }) {
    const { error } = model;
    return error ? (React.createElement("div", { style: { display: 'flex', alignItems: 'flex-start' } },
        React.createElement("div", { style: { flex: 1 } },
            React.createElement(ErrorMessage, { error: error })),
        React.createElement(IconButton, { size: "small", "aria-label": "Dismiss error", onClick: () => {
                model.setError(undefined);
            } },
            React.createElement(CloseIcon, { fontSize: "small" })))) : null;
});
const ProteinViewContainer = observer(function ProteinViewContainer({ model, parentRef, loading, }) {
    const { width, height, structures } = model;
    // Capture/automation signal: the structure has finished loading and no
    // pairwise alignment is still pending, so the view is painted in its settled
    // state. Lets screenshot/e2e tooling wait deterministically instead of
    // guessing a fixed settle time.
    const ready = !loading && structures.every(s => !s.alignmentPending);
    return (React.createElement("div", { style: { background: '#ccc' }, "data-testid": ready ? 'protein-view-ready' : 'protein-view-loading' },
        React.createElement(DismissableError, { model: model }),
        loading ? (React.createElement(LoadingEllipses, { message: "Loading protein viewer" })) : (React.createElement(ProteinViewHeader, { model: model })),
        React.createElement("div", { ref: parentRef, "data-testid": "protein-view-molstar", style: {
                position: 'relative',
                width,
                height,
            } }),
        React.createElement(ResizeHandle, { style: { height: 4, background: 'grey' }, onDrag: delta => {
                return model.setHeight(model.height + delta);
            } }),
        React.createElement(ManualAlignmentDialog, { model: model })));
});
export default ProteinView;
