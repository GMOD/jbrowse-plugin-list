import React from 'react';
import Typography from '@mui/material/Typography';
const swatch = {
    width: 8,
    height: 8,
    border: '1px solid rgba(0,0,0,0.3)',
};
function KeyRow({ title, testId, color, children, }) {
    return (React.createElement(Typography, { variant: "caption", color: color, component: "div", "data-testid": testId, style: {
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 6,
            fontSize: 9,
            paddingLeft: 8,
        } },
        React.createElement("span", null,
            title,
            ":"),
        children));
}
export function ColorKey({ title, entries, testId = 'track-legend', color = 'textSecondary', }) {
    return (React.createElement(KeyRow, { title: title, testId: testId, color: color }, entries.map(({ label, color }, i) => (React.createElement("span", { key: `${i}-${label}`, style: { display: 'inline-flex', alignItems: 'center', gap: 3 } },
        React.createElement("span", { style: { ...swatch, background: color } }),
        label)))));
}
export function GradientKey({ title, minLabel, maxLabel, colors, testId = 'track-legend', color = 'textSecondary', }) {
    return (React.createElement(KeyRow, { title: title, testId: testId, color: color },
        minLabel,
        React.createElement("span", { style: {
                ...swatch,
                width: 60,
                background: `linear-gradient(to right, ${colors.join(', ')})`,
            } }),
        maxLabel));
}
// Mol*'s Color is a 0xRRGGBB number; formatted here so the header does not
// pull Mol* into the bundle every host evaluates on boot.
function cssColor(color) {
    return `#${color.toString(16).padStart(6, '0')}`;
}
// Mol* names secondary structure in camelCase (alphaHelix); chain ids and
// residue names are case-sensitive and stay as given
export function words(name) {
    return name.replaceAll(/([a-z])([A-Z])(?=[a-z])/g, (_, a, b) => `${a} ${b.toLowerCase()}`);
}
export function MolstarLegendKey({ title, legend, }) {
    return legend.kind === 'table-legend' ? (React.createElement(ColorKey, { title: title, testId: "structure-legend", entries: legend.table.map(([name, color]) => ({
            label: words(name),
            color: cssColor(color),
        })) })) : (React.createElement(GradientKey, { title: title, testId: "structure-legend", minLabel: legend.minLabel, maxLabel: legend.maxLabel, colors: legend.colors.map(entry => Array.isArray(entry)
            ? `${cssColor(entry[0])} ${100 * entry[1]}%`
            : cssColor(entry)) }));
}
