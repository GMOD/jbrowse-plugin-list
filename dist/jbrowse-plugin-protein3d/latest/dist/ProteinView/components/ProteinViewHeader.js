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
import { ColorKey, MolstarLegendKey } from './ColorKey';
import HeaderStructureRows from './HeaderStructureRow';
import ProteinAlignment from './ProteinAlignment';
import ProteinAlignmentHelpButton from './ProteinAlignmentHelpButton';
import { COLOR_FIELDS, DEFAULT_COLOR_LABEL, colorLabelOf, } from '../proteinColor';
const COLOR_CHOICES = [
    { label: DEFAULT_COLOR_LABEL },
    ...Object.entries(COLOR_FIELDS).map(([field, { label }]) => ({
        field: field,
        label,
    })),
];
// An icon rather than a select showing the field's name, which took the
// width of a structure's coverage line on every row beside it
const ColorMenu = observer(function ColorMenu({ model, }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const title = `Color by: ${colorLabelOf(model.color)}`;
    return (React.createElement(React.Fragment, null,
        React.createElement(Tooltip, { title: title },
            React.createElement(IconButton, { size: "small", "aria-label": title, onClick: event => {
                    setAnchorEl(event.currentTarget);
                } },
                React.createElement(PaletteIcon, { fontSize: "small" }))),
        React.createElement(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: () => {
                setAnchorEl(null);
            } }, COLOR_CHOICES.map(({ field, label }) => (React.createElement(MenuItem, { key: label, dense: true, selected: field === model.color.field, onClick: () => {
                if (field !== model.color.field) {
                    model.setColor(field ? { field } : {});
                }
                setAnchorEl(null);
            } }, label))))));
});
function ToggleMenuItem({ checked, label, disabled, onToggle, }) {
    return (React.createElement(MenuItem, { onClick: () => {
            onToggle();
        }, disabled: disabled, dense: true },
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
        React.createElement(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: () => {
                setAnchorEl(null);
            } },
            model.displayToggles.map(toggle => (React.createElement(ToggleMenuItem, { key: toggle.key, checked: toggle.checked, label: toggle.label, disabled: toggle.disabled, onToggle: toggle.toggle }))),
            React.createElement(Divider, null),
            model.behaviorToggles.map(toggle => (React.createElement(ToggleMenuItem, { key: toggle.label, checked: toggle.checked, label: toggle.label, onToggle: toggle.toggle }))))));
});
const ProteinViewHeader = observer(function ProteinViewHeader({ model, }) {
    const { alignmentStructure, showAlignment, colorLegend, domainLegend } = model;
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
                React.createElement(ColorMenu, { model: model }),
                React.createElement(DisplaySettingsMenu, { model: model }),
                React.createElement(ProteinAlignmentHelpButton, { model: model }))),
        domainLegend ? (domainLegend.map(group => (React.createElement(ColorKey, { key: group.title, title: group.title, entries: group.entries, testId: "structure-legend" })))) : colorLegend ? (React.createElement(MolstarLegendKey, { title: "Structure colors", legend: colorLegend })) : null,
        showAlignment && alignmentStructure?.pairwiseAlignment ? (React.createElement(ProteinAlignment, { model: alignmentStructure })) : showAlignment && alignmentStructure?.alignmentPending ? (React.createElement(LoadingEllipses, { message: "Loading pairwise alignment" })) : null));
});
export default ProteinViewHeader;
