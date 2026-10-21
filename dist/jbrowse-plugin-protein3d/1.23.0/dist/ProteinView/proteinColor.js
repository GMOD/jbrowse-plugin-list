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
    track: { label: 'Genome track', theme: 'genome-track' },
    values: { label: 'Your own values', theme: 'residue-values' },
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
    'track',
    'values',
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
/**
 * The view's color object: the `field` its structures are colored by, unset
 * for Mol*'s default, and for a field whose scale is the plugin's the members
 * of that scale overriding its preset in `RESIDUE_COLORS`.
 */
export const TRACK_STATS = ['mean', 'max', 'min'];
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
/**
 * Members past the scale's that a scaled field takes; the value is what the
 * member must be.
 */
const FIELD_MEMBERS = {
    track: ['trackId', 'stat'],
    values: ['values'],
};
function isDataScaledField(field) {
    return field === 'track' || field === 'values';
}
/**
 * A field's preset scale. `track` and `values` also take a threshold scale,
 * which has no sensible cuts of its own, so a session names them.
 */
function presetOf(field, scale) {
    return isDataScaledField(field) && scale === 'threshold'
        ? {
            field,
            scale: 'threshold',
            domain: [],
            range: [],
            title: RESIDUE_COLORS[field].title,
        }
        : RESIDUE_COLORS[field];
}
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
function isResidueValues(value) {
    if (Array.isArray(value)) {
        return value.every(v => v === null || (typeof v === 'number' && Number.isFinite(v)));
    }
    return (typeof value === 'object' &&
        value !== null &&
        Object.entries(value).every(([key, v]) => Number.isInteger(Number(key)) &&
            Number(key) >= 1 &&
            typeof v === 'number' &&
            Number.isFinite(v)));
}
const MEMBER_TYPES = {
    domain: [isNumbers, 'a list of numbers'],
    range: [isStrings, 'a list of CSS colors'],
    labels: [isStrings, 'a list of strings'],
    title: [v => typeof v === 'string', 'a string'],
    trackId: [v => typeof v === 'string' && v !== '', 'a track id'],
    stat: [
        v => TRACK_STATS.some(s => s === v),
        `one of ${TRACK_STATS.join(', ')}`,
    ],
    values: [
        isResidueValues,
        'a list of numbers, or an object of numbers keyed by residue number',
    ],
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
    const preset = presetOf(field, members.scale);
    const allowed = [
        ...SCALE_MEMBERS[preset.scale],
        ...(FIELD_MEMBERS[field] ?? []),
    ];
    const missing = field === 'track' && members.trackId === undefined
        ? ["color.trackId is required: a track's scores color a track field"]
        : field === 'values' && members.values === undefined
            ? ['color.values is required: the numbers to color the residues by']
            : preset.scale === 'threshold' &&
                isDataScaledField(field) &&
                !(Array.isArray(members.domain) && members.domain.length > 0)
                ? [`color.domain is required: the cuts of ${field}'s threshold scale`]
                : [];
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
    const domainFromData = isDataScaledField(field) &&
        preset.scale === 'linear' &&
        !(members.domainMin !== undefined && members.domainMax !== undefined);
    return problems.length > 0 || missing.length > 0 || !resolved
        ? [...missing, ...problems]
        : scaleProblems(field, resolved, domainFromData);
}
function scaleProblems(field, color, domainFromData = false) {
    if (color.scale === 'threshold') {
        const { domain, range } = color;
        return [
            ...(domain.every((cut, i) => i === 0 || cut > domain[i - 1])
                ? []
                : [
                    `color.domain of ${field} ascends, each cut above the last; ${JSON.stringify(domain)} does not`,
                ]),
            ...(range.length === domain.length + 1
                ? []
                : [
                    `color.range of ${field} needs ${domain.length + 1} colors, one more than domain's cuts`,
                ]),
        ];
    }
    const { domainMin, domainMax, domainMid, range } = color;
    if (domainFromData) {
        return range.length > 0
            ? []
            : [`color.range of ${field} needs at least one color`];
    }
    const reversed = domainMin > domainMax &&
        (domainMid === undefined ||
            (domainMid >= domainMax && domainMid <= domainMin));
    return [
        ...(domainMin < domainMax || reversed
            ? []
            : [
                `color.domainMin of ${field} is below domainMax; ${domainMin} is not below ${domainMax}`,
            ]),
        ...(domainMin < domainMax &&
            domainMid !== undefined &&
            (domainMid < domainMin || domainMid > domainMax)
            ? [
                `color.domainMid of ${field} lies from domainMin to domainMax; ${domainMid} is outside ${domainMin}–${domainMax}`,
            ]
            : []),
        ...(range.length > 0
            ? []
            : [`color.range of ${field} needs at least one color`]),
    ];
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
    const { field, trackId, stat, values, ...members } = color;
    return field && isScaledField(field)
        ? { ...presetOf(field, members.scale), ...members }
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
