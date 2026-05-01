/**
 * Isoform Expression Quantification Adapter
 */
export default class IeqFeature {
    constructor(args) {
        this.iso = args.iso;
        this.data = this.dataFromIso(this.iso);
        this._id = args.id;
    }
    get(field) {
        return this.data[field] || this.iso[field];
    }
    set() { }
    parent() {
        return undefined;
    }
    children() {
        return undefined;
    }
    tags() {
        const t = [...Object.keys(this.data), ...Object.keys(this.iso)];
        return t;
    }
    id() {
        return this._id;
    }
    dataFromIso(iso) {
        const featureData = {
            refName: iso.chromosome,
            start: +iso.start - 1,
            end: +iso.end,
            name: `${iso.mirna_id}, ${iso.read_count} reads`,
            strand: 1,
        };
        return featureData;
    }
    toJSON() {
        return {
            uniqueId: this._id,
            ...this.iso,
            ...this.data,
        };
    }
}
//# sourceMappingURL=IeqFeature.js.map