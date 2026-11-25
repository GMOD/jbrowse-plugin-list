import { MAX_MODIFICATION_CALLS } from '../LaunchTView/modifications';
/** the SAMtags codes, and the ChEBI ids JBrowse names */
const NAMES = {
    m: '5mC',
    h: '5hmC',
    f: '5fC',
    c: '5caC',
    g: '5hmU',
    e: '5fU',
    b: '5caU',
    a: '6mA',
    o: '8oxoG',
    n: 'xao',
    17082: 'pseU',
    17596: 'inosine',
    21839: '4mC',
};
export const MODIFICATION_FILL = {
    channel: 'featureFill',
    field: 'probability',
    scale: {
        type: 'linear',
        domainMin: 0,
        domainMax: 100,
        range: ['#0000ff', '#ff0000'],
    },
    legend: { title: 'modification %' },
};
export function modificationName(type) {
    return NAMES[type] ?? type;
}
export function modificationAnnotations({ rows, types, row, residue, type, prob, }) {
    return Array.from(row, (r, i) => {
        const name = modificationName(types[type[i]]);
        const percent = Math.round(((prob[i] + 0.5) / 256) * 100);
        return {
            id: rows[r],
            accession: name,
            name,
            description: `${name} ${percent}%`,
            featureType: 'modified_base',
            start: residue[i],
            end: residue[i],
            attributes: { probability: String(percent) },
        };
    });
}
const n = (x) => x.toLocaleString('en-US');
export function modificationSummaryLine({ shown, dropped, unplaced, }) {
    return [
        `${n(shown)} calls shown`,
        ...(dropped
            ? [
                `${n(dropped)} less probable over the ${n(MAX_MODIFICATION_CALLS)} cap`,
            ]
            : []),
        ...(unplaced
            ? [`${n(unplaced)} ${unplaced === 1 ? 'row' : 'rows'} not annotated`]
            : []),
    ].join(', ');
}
export function modificationMenu(summary, view) {
    const byModification = view.resolvedResidueColor.field === 'feature';
    const colorBy = (field) => () => {
        view.setResidueColor({ ...view.residueColor, field });
    };
    const summaryLine = summary.dropped || summary.unplaced
        ? [{ type: 'subHeader', label: modificationSummaryLine(summary) }]
        : [];
    return {
        label: 'Base modifications',
        subMenu: [
            {
                label: 'Color by bases',
                type: 'radio',
                checked: !byModification,
                onClick: colorBy('residue'),
            },
            {
                label: 'Color by modification',
                type: 'radio',
                checked: byModification,
                onClick: colorBy('feature'),
            },
            ...summaryLine,
        ],
    };
}
//# sourceMappingURL=modifications.js.map