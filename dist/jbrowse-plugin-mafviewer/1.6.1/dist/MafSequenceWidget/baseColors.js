function getBases(theme) {
    return theme.palette.bases;
}
export function getBaseColor(base, theme) {
    const bases = getBases(theme);
    if (!bases) {
        switch (base.toUpperCase()) {
            case 'A':
                return '#6dbf6d';
            case 'C':
                return '#6c6cff';
            case 'G':
                return '#ffb347';
            case 'T':
            case 'U':
                return '#ff6b6b';
            default:
                return theme.palette.grey[500];
        }
    }
    switch (base.toUpperCase()) {
        case 'A':
            return bases.A.main;
        case 'C':
            return bases.C.main;
        case 'G':
            return bases.G.main;
        case 'T':
        case 'U':
            return bases.T.main;
        default:
            return theme.palette.grey[500];
    }
}
export function getContrastText(base, theme) {
    const bases = getBases(theme);
    if (!bases) {
        switch (base.toUpperCase()) {
            case 'A':
            case 'C':
            case 'T':
            case 'U':
                return '#fff';
            case 'G':
                return '#000';
            default:
                return theme.palette.common.white;
        }
    }
    switch (base.toUpperCase()) {
        case 'A':
            return bases.A.contrastText;
        case 'C':
            return bases.C.contrastText;
        case 'G':
            return bases.G.contrastText;
        case 'T':
        case 'U':
            return bases.T.contrastText;
        default:
            return theme.palette.common.white;
    }
}
//# sourceMappingURL=baseColors.js.map