export function makeId(h, taxonomyInfo) {
    let speciesName = h.sciname.replaceAll(' ', '_');
    if (h.taxid && taxonomyInfo?.has(h.taxid)) {
        const info = taxonomyInfo.get(h.taxid);
        if (info.commonName) {
            speciesName = info.commonName
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('_');
        }
    }
    return `${h.accession}-${speciesName}`;
}
export function strip(s) {
    return s.replace('-', '');
}
//# sourceMappingURL=util.js.map