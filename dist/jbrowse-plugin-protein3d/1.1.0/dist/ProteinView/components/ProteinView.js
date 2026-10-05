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
// Mol* being up says nothing about the structure: the fetch, the parse, the
// alignment and the SIFTS lookup all run afterwards, and used to run behind an
// empty grey canvas. Sits over the canvas rather than in it, and passes the
// pointer through, so nothing it covers stops responding.
const StructureLoadingOverlay = observer(function StructureLoadingOverlay({ model, }) {
    const { loadingMessages } = model;
    return loadingMessages.length > 0 ? (React.createElement("div", { "data-testid": "protein-view-loading-overlay", style: {
            position: 'absolute',
            top: 8,
            left: 8,
            maxWidth: 'calc(100% - 16px)',
            padding: '2px 8px',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.85)',
            color: '#000',
            pointerEvents: 'none',
        } }, loadingMessages.map(({ id, message }) => (React.createElement(LoadingEllipses, { key: id, message: message }))))) : null;
});
const ProteinViewContainer = observer(function ProteinViewContainer({ model, parentRef, loading, }) {
    const { width, height } = model;
    // for screenshot and e2e tooling: Mol* is up and every structure has settled
    const ready = !loading && !model.showLoading;
    return (React.createElement("div", { style: { background: '#ccc' }, "data-testid": ready ? 'protein-view-ready' : 'protein-view-loading' },
        React.createElement(DismissableError, { model: model }),
        loading ? (React.createElement(LoadingEllipses, { message: "Loading protein viewer" })) : (React.createElement(ProteinViewHeader, { model: model })),
        React.createElement("div", { style: { position: 'relative', width, height } },
            React.createElement("div", { ref: parentRef, "data-testid": "protein-view-molstar", style: {
                    position: 'relative',
                    width,
                    height,
                } }),
            React.createElement(StructureLoadingOverlay, { model: model })),
        React.createElement(ResizeHandle, { style: { height: 4, background: 'grey' }, onDrag: delta => {
                return model.setHeight(model.height + delta);
            } }),
        React.createElement(ManualAlignmentDialog, { model: model })));
});
export default ProteinView;
