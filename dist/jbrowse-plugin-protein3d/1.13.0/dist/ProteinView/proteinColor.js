import { RESIDUE_COLORS } from './residueColors';
/**
 * The fields the view colors its structures by, each with its menu label and
 * the Mol* theme that paints it. The themes `mapped-chain`, `kyte-doolittle`,
 * `alphamissense`, `clinvar` and `alignment-domains` are registerColorThemes',
 * `plddt-confidence` the MAQualityAssessment behavior's, the rest Mol*'s.
 */
export const COLOR_FIELDS = {
    plddt: { label: 'pLDDT confidence (AlphaFold)', theme: 'plddt-confidence' },
    chain: { label: 'Chain', theme: 'chain-id' },
    secondaryStructure: {
        label: 'Secondary structure',
        theme: 'secondary-structure',
    },
    hydrophobicity: {
        label: 'Hydrophobicity (Kyte-Doolittle)',
        theme: 'kyte-doolittle',
    },
    residueName: { label: 'Residue type', theme: 'residue-name' },
    bFactor: { label: 'B-factor / uncertainty', theme: 'uncertainty' },
    moleculeType: { label: 'Molecule type', theme: 'molecule-type' },
    mappedChain: { label: 'Mapped chain', theme: 'mapped-chain' },
    alphaMissense: {
        label: 'AlphaMissense pathogenicity',
        theme: 'alphamissense',
    },
    clinvarPathogenicCount: {
        label: 'ClinVar pathogenic variants',
        theme: 'clinvar',
    },
    domain: { label: 'Domains from the alignment', theme: 'alignment-domains' },
};
export const DEFAULT_COLOR_LABEL = 'Default (element/chain)';
/**
 * The fields whose scale is this plugin's, so their color object takes
 * members past `field`.
 */
const SCALED_FIELDS = [
    'hydrophobicity',
    'alphaMissense',
    'clinvarPathogenicCount',
];
/**
 * Who paints a field whose color object names the field alone, for the
 * message that refuses a member on one.
 */
const PAINTED_BY = {
    plddt: "Mol*'s pLDDT bands",
    chain: "Mol*'s palette",
    secondaryStructure: "Mol*'s palette",
    residueName: "Mol*'s palette",
    bFactor: "Mol*'s palette",
    moleculeType: "Mol*'s palette",
    mappedChain: 'two fixed colors',
    domain: "the connected alignment's colors",
};
const SCALE_MEMBERS = {
    threshold: ['scale', 'domain', 'range', 'labels', 'title'],
    linear: [
        'scale',
        'domainMin',
        'domainMax',
        'domainMid',
        'range',
        'labels',
        'title',
    ],
};
function isColorField(field) {
    return typeof field === 'string' && Object.hasOwn(COLOR_FIELDS, field);
}
function isScaledField(field) {
    return SCALED_FIELDS.some(f => f === field);
}
function isStrings(value) {
    return Array.isArray(value) && value.every(v => typeof v === 'string');
}
function isNumbers(value) {
    return (Array.isArray(value) &&
        value.every(v => typeof v === 'number' && Number.isFinite(v)));
}
const MEMBER_TYPES = {
    domain: [isNumbers, 'a list of numbers'],
    range: [isStrings, 'a list of CSS colors'],
    labels: [isStrings, 'a list of strings'],
    title: [v => typeof v === 'string', 'a string'],
    domainMin: [v => typeof v === 'number' && Number.isFinite(v), 'a number'],
    domainMax: [v => typeof v === 'number' && Number.isFinite(v), 'a number'],
    domainMid: [v => typeof v === 'number' && Number.isFinite(v), 'a number'],
};
/** What is wrong with a color object, one line each; empty when nothing is. */
export function colorProblems(color) {
    if (typeof color !== 'object' || color === null || Array.isArray(color)) {
        return ["color is an object, such as { field: 'alphaMissense' }"];
    }
    const { field, ...members } = color;
    const named = Object.keys(members);
    if (field === undefined) {
        return named.length > 0
            ? [`color names no field, so ${named.join(', ')} paints nothing`]
            : [];
    }
    if (!isColorField(field)) {
        return [
            `color.field ${JSON.stringify(field)} is none of ${Object.keys(COLOR_FIELDS).join(', ')}`,
        ];
    }
    if (!isScaledField(field)) {
        return named.map(key => `color.${key} is refused: ${field} paints in ${PAINTED_BY[field]}, so its color names the field alone`);
    }
    const preset = RESIDUE_COLORS[field];
    const allowed = SCALE_MEMBERS[preset.scale];
    const problems = named.flatMap(key => {
        const value = members[key];
        if (!allowed.includes(key)) {
            return [
                `color.${key} is not a member of ${field}'s ${preset.scale} scale, which takes ${allowed.join(', ')}`,
            ];
        }
        if (key === 'scale') {
            return value === preset.scale
                ? []
                : [`color.scale of ${field} is ${preset.scale}`];
        }
        const [accepts, kind] = MEMBER_TYPES[key];
        return accepts(value) ? [] : [`color.${key} is ${kind}`];
    });
    const resolved = resolvedColor(color);
    if (problems.length === 0 &&
        resolved?.scale === 'threshold' &&
        resolved.range.length !== resolved.domain.length + 1) {
        problems.push(`color.range of ${field} needs ${resolved.domain.length + 1} colors, one more than domain's cuts`);
    }
    return problems;
}
/** `color`, refused with every problem {@link colorProblems} finds. */
export function checkedColor(color) {
    const problems = colorProblems(color);
    if (problems.length > 0) {
        throw new Error(problems.join('; '));
    }
    return color;
}
/**
 * The scale a color object paints through, its members over the field's
 * preset; undefined for a field whose colors are Mol*'s or the alignment's.
 */
export function resolvedColor(color) {
    const { field, ...members } = color;
    return field && isScaledField(field)
        ? { ...RESIDUE_COLORS[field], ...members }
        : undefined;
}
/** The Mol* theme a color object paints with; undefined is Mol*'s default. */
export function molstarThemeOf(color) {
    return color.field ? COLOR_FIELDS[color.field].theme : undefined;
}
export function colorLabelOf(color) {
    return color.field ? COLOR_FIELDS[color.field].label : DEFAULT_COLOR_LABEL;
}
/** The `colorScheme` names sessions and urls wrote before `color`. */
const COLOR_SCHEME_FIELDS = {
    default: undefined,
    'plddt-confidence': 'plddt',
    'chain-id': 'chain',
    'secondary-structure': 'secondaryStructure',
    hydrophobicity: 'hydrophobicity',
    'residue-name': 'residueName',
    uncertainty: 'bFactor',
    'molecule-type': 'moleculeType',
    'mapped-chain': 'mappedChain',
    alphamissense: 'alphaMissense',
    clinvar: 'clinvarPathogenicCount',
    'alignment-domains': 'domain',
};
/** A `colorScheme` name as a color object; an unknown one is Mol*'s default. */
export function colorOfScheme(scheme) {
    const field = Object.hasOwn(COLOR_SCHEME_FIELDS, scheme)
        ? COLOR_SCHEME_FIELDS[scheme]
        : undefined;
    return field ? { field } : {};
}
