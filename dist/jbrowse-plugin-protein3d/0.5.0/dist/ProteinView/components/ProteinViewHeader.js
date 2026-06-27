import React, { useState } from 'react';
import { LoadingEllipses } from '@jbrowse/core/ui';
import TuneIcon from '@mui/icons-material/Tune';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
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
function ToggleMenuItem({ checked, label, onToggle, }) {
    return (React.createElement(MenuItem, { onClick: () => {
            onToggle();
        }, dense: true },
        React.createElement(ListItemIcon, null,
            React.createElement(Checkbox, { checked: checked, size: "small", edge: "start", disableRipple: true })),
        React.createElement(ListItemText, null, label)));
}
function getDisplayToggles(model) {
    return [
        {
            label: 'Show alignment',
            checked: model.showAlignment,
            onToggle: () => {
                model.setShowAlignment(!model.showAlignment);
            },
        },
        {
            label: 'Show features',
            checked: model.showProteinTracks,
            onToggle: () => {
                model.setShowProteinTracks(!model.showProteinTracks);
            },
        },
        {
            label: 'Auto-scroll features',
            checked: model.autoScrollAlignment,
            onToggle: () => {
                model.setAutoScrollAlignment(!model.autoScrollAlignment);
            },
        },
        {
            label: 'Compact tracks',
            checked: model.compactTracks,
            onToggle: () => {
                model.setCompactTracks(!model.compactTracks);
            },
        },
    ];
}
const DisplaySettingsMenu = observer(function DisplaySettingsMenu({ model, }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const hasHiddenTracks = model.structures.some(s => s.hiddenFeatureTypes.size > 0);
    return (React.createElement(React.Fragment, null,
        React.createElement(Tooltip, { title: "Display settings" },
            React.createElement(IconButton, { size: "small", onClick: event => {
                    setAnchorEl(event.currentTarget);
                } },
                React.createElement(TuneIcon, { fontSize: "small" }))),
        React.createElement(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: () => {
                setAnchorEl(null);
            } },
            getDisplayToggles(model).map(toggle => (React.createElement(ToggleMenuItem, { key: toggle.label, checked: toggle.checked, label: toggle.label, onToggle: toggle.onToggle }))),
            hasHiddenTracks ? (React.createElement(MenuItem, { dense: true, onClick: () => {
                    for (const structure of model.structures) {
                        structure.showAllFeatureTypes();
                    }
                } },
                React.createElement(ListItemText, { inset: true }, "Restore hidden feature tracks"))) : null)));
});
const ProteinViewHeader = observer(function ProteinViewHeader({ model, }) {
    const { structures, showAlignment } = model;
    return (React.createElement("div", null,
        React.createElement("div", { style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            } },
            React.createElement(HeaderStructureInfo, { model: model }),
            React.createElement("div", { style: {
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    flexShrink: 0,
                } },
                React.createElement(ColorSchemeSelect, { model: model }),
                React.createElement(DisplaySettingsMenu, { model: model }))),
        showAlignment
            ? structures
                .filter(s => s.pairwiseAlignment || s.alignmentPending)
                .map((structure, idx) => (React.createElement("div", { key: idx }, structure.pairwiseAlignment ? (React.createElement(ProteinAlignment, { model: structure })) : (React.createElement(LoadingEllipses, { message: "Loading pairwise alignment" })))))
            : null,
        React.createElement(AddStructureDialog, { model: model })));
});
export default ProteinViewHeader;
