import React, { useState } from 'react';
import { LoadingEllipses } from '@jbrowse/core/ui';
import PaletteIcon from '@mui/icons-material/Palette';
import TuneIcon from '@mui/icons-material/Tune';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { observer } from 'mobx-react';
import AddStructureDialog from './AddStructureDialog';
import { MolstarLegendKey } from './ColorKey';
import HeaderStructureRows from './HeaderStructureRow';
import ProteinAlignment from './ProteinAlignment';
import ProteinAlignmentHelpButton from './ProteinAlignmentHelpButton';
import { COLOR_SCHEMES } from '../applyColorTheme';
// An icon rather than a select showing the scheme's name, which took the
// width of a structure's coverage line on every row beside it
const ColorSchemeMenu = observer(function ColorSchemeMenu({ model, }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const current = COLOR_SCHEMES.find(s => s.value === model.colorScheme);
    const title = `Color scheme: ${current?.label ?? model.colorScheme}`;
    return (React.createElement(React.Fragment, null,
        React.createElement(Tooltip, { title: title },
            React.createElement(IconButton, { size: "small", "aria-label": title, onClick: event => {
                    setAnchorEl(event.currentTarget);
                } },
                React.createElement(PaletteIcon, { fontSize: "small" }))),
        React.createElement(Menu, { keepMounted: true, anchorEl: anchorEl, open: Boolean(anchorEl), onClose: () => {
                setAnchorEl(null);
            } }, COLOR_SCHEMES.map(scheme => (React.createElement(MenuItem, { key: scheme.value, dense: true, selected: scheme.value === model.colorScheme, onClick: () => {
                model.setColorScheme(scheme.value);
                setAnchorEl(null);
            } }, scheme.label))))));
});
function ToggleMenuItem({ checked, label, onToggle, }) {
    return (React.createElement(MenuItem, { onClick: () => {
            onToggle();
        }, dense: true },
        React.createElement(ListItemIcon, null,
            React.createElement(Checkbox, { checked: checked, size: "small", edge: "start", disableRipple: true })),
        React.createElement(ListItemText, null, label)));
}
// Every toggle the view has, in one menu. The view menu carries actions, so a
// reader looking for a checkbox has one place to look rather than two lists
// that used to hold overlapping copies of the same four.
const DisplaySettingsMenu = observer(function DisplaySettingsMenu({ model, }) {
    const [anchorEl, setAnchorEl] = useState(null);
    return (React.createElement(React.Fragment, null,
        React.createElement(Tooltip, { title: "Display settings" },
            React.createElement(IconButton, { size: "small", onClick: event => {
                    setAnchorEl(event.currentTarget);
                } },
                React.createElement(TuneIcon, { fontSize: "small" }))),
        React.createElement(Menu, { keepMounted: true, anchorEl: anchorEl, open: Boolean(anchorEl), onClose: () => {
                setAnchorEl(null);
            } },
            model.displayToggles.map(toggle => (React.createElement(ToggleMenuItem, { key: toggle.label, checked: toggle.checked, label: toggle.label, onToggle: toggle.toggle }))),
            React.createElement(Divider, null),
            model.behaviorToggles.map(toggle => (React.createElement(ToggleMenuItem, { key: toggle.label, checked: toggle.checked, label: toggle.label, onToggle: toggle.toggle }))))));
});
const ProteinViewHeader = observer(function ProteinViewHeader({ model, }) {
    const { alignmentStructure, showAlignment, colorLegend } = model;
    return (React.createElement("div", null,
        React.createElement("div", { style: { display: 'flex', alignItems: 'flex-start', gap: 8 } },
            React.createElement(HeaderStructureRows, { model: model }),
            React.createElement("div", { style: {
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                    flexShrink: 0,
                    minHeight: 24,
                } },
                React.createElement(ColorSchemeMenu, { model: model }),
                React.createElement(DisplaySettingsMenu, { model: model }),
                React.createElement(ProteinAlignmentHelpButton, { model: model }))),
        colorLegend ? (React.createElement(MolstarLegendKey, { title: "Structure colors", legend: colorLegend })) : null,
        showAlignment && alignmentStructure?.pairwiseAlignment ? (React.createElement(ProteinAlignment, { model: alignmentStructure })) : showAlignment && alignmentStructure?.alignmentPending ? (React.createElement(LoadingEllipses, { message: "Loading pairwise alignment" })) : null,
        React.createElement(AddStructureDialog, { model: model })));
});
export default ProteinViewHeader;
