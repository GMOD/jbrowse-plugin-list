/**
 * Splice Junction Quantification Adapter
 */
export default class SjqFeature {
    constructor(args) {
        this.sjq = args.sjq;
        this.data = this.dataFromSjq(this.sjq);
        this._id = args.id;
    }
    get(field) {
        return this.data[field] || this.sjq[field];
    }
    set() { }
    parent() {
        return undefined;
    }
    children() {
        return undefined;
    }
    tags() {
        const t = [...Object.keys(this.data), ...Object.keys(this.sjq)];
        return t;
    }
    id() {
        return this._id;
    }
    // #chromosome	intron_start	intron_end	strand	intron_motif	annotation	n_unique_map	n_multi_map	max_splice_overhang
    dataFromSjq(sjq) {
        const featureData = {
            refName: sjq.chromosome,
            start: +sjq.intron_start - 1,
            end: +sjq.intron_end,
            score: +sjq.n_unique_map + +sjq.n_multi_map,
            name: `unique: ${sjq.n_unique_map}, multi: ${sjq.n_multi_map}`,
        };
        return featureData;
    }
    toJSON() {
        return {
            uniqueId: this._id,
            ...this.sjq,
            ...this.data,
        };
    }
}
//# sourceMappingURL=SjqFeature.js.map