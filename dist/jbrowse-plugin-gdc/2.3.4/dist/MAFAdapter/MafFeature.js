export default class MafFeature {
    constructor(args) {
        this.mutation = args.mutation;
        this.data = this.dataFromMutation(this.mutation);
        this._id = args.id;
    }
    get(field) {
        return this.data[field] || this.mutation[field];
    }
    set() { }
    parent() {
        return undefined;
    }
    children() {
        return undefined;
    }
    tags() {
        const t = [...Object.keys(this.data), ...Object.keys(this.mutation)];
        return t;
    }
    id() {
        return this._id;
    }
    dataFromMutation(mutation) {
        const featureData = {
            refName: mutation.chromosome,
            start: +mutation.start_position - 1,
            end: +mutation.end_position,
            name: `${mutation.chromosome}:g.${mutation.start_position}${mutation.tumor_seq_allele1}>${mutation.tumor_seq_allele2}`,
            note: mutation.hgvsc,
            // score: +mutation.score,
        };
        return featureData;
    }
    toJSON() {
        return {
            uniqueId: this._id,
            ...this.mutation,
            ...this.data,
        };
    }
}
//# sourceMappingURL=MafFeature.js.map