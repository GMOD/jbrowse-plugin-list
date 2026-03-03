function isStrs(array) {
    return typeof array[0] === 'string';
}
export function normalize(r) {
    return isStrs(r)
        ? r.map(elt => ({
            id: elt,
            label: elt,
            color: undefined,
        }))
        : r;
}
//# sourceMappingURL=util.js.map