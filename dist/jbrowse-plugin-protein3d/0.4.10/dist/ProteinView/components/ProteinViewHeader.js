import React from 'react';
import { LoadingEllipses } from '@jbrowse/core/ui';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { observer } from 'mobx-react';
import AddStructureDialog from './AddStructureDialog';
import HeaderStructureInfo from './HeaderStructureInfo';
import ProteinAlignment from './ProteinAlignment';
import { COLOR_SCHEMES } from '../applyColorTheme';
const ColorSchemeSelect = observer(function ColorSchemeSelect({ model, }) {
    return (React.createElement(TextField, { select: true, size: "small", label: "Color", value: model.colorScheme, onChange: event => {
            const scheme = COLOR_SCHEMES.find(s => s.value === event.target.value);
            if (scheme) {
                model.setColorScheme(scheme.value);
            }
        }, slotProps: { select: { native: false } }, sx: { minWidth: 180 } }, COLOR_SCHEMES.map(scheme => (React.createElement(MenuItem, { key: scheme.value, value: scheme.value }, scheme.label)))));
});
function ToggleCheckbox({ checked, label, onToggle, }) {
    return (React.createElement(FormControlLabel, { control: React.createElement(Checkbox, { checked: checked, onChange: () => {
                onToggle();
            }, size: "small" }), label: label }));
}
const ProteinViewHeader = observer(function ProteinViewHeader({ model, }) {
    const { structures, showAlignment, showProteinTracks, autoScrollAlignment } = model;
    return (React.createElement("div", null,
        React.createElement("div", { style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            } },
            React.createElement(HeaderStructureInfo, { model: model }),
            React.createElement("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
                React.createElement(ColorSchemeSelect, { model: model }),
                React.createElement(ToggleCheckbox, { checked: showAlignment, label: "Show alignment", onToggle: () => {
                        model.setShowAlignment(!showAlignment);
                    } }),
                React.createElement(ToggleCheckbox, { checked: showProteinTracks, label: "Show features", onToggle: () => {
                        model.setShowProteinTracks(!showProteinTracks);
                    } }),
                React.createElement(ToggleCheckbox, { checked: autoScrollAlignment, label: "Auto-scroll features", onToggle: () => {
                        model.setAutoScrollAlignment(!autoScrollAlignment);
                    } }))),
        showAlignment
            ? structures.map((structure, idx) => (React.createElement("div", { key: idx }, structure.pairwiseAlignment ? (React.createElement(ProteinAlignment, { model: structure })) : (React.createElement(LoadingEllipses, { message: "Loading pairwise alignment" })))))
            : null,
        React.createElement(AddStructureDialog, { model: model })));
});
export default ProteinViewHeader;
