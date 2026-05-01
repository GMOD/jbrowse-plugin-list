export default class MbvFeature {
    constructor(args) {
        this.value = args.value;
        this.data = this.dataFromValue(this.value);
        this._id = args.id;
    }
    get(field) {
        return this.data[field] || this.value[field];
    }
    set() { }
    parent() {
        return undefined;
    }
    children() {
        return undefined;
    }
    tags() {
        const t = [...Object.keys(this.data), ...Object.keys(this.value)];
        return t;
    }
    id() {
        return this._id;
    }
    dataFromValue(value) {
        const featureData = {
            refName: value.chromosome,
            start: +value.start - 1,
            end: +value.end,
            name: `${value['composite element ref']}`,
            note: value.beta_value,
        };
        return featureData;
    }
    toJSON() {
        return {
            uniqueId: this._id,
            ...this.value,
            ...this.data,
        };
    }
}
//# sourceMappingURL=MbvFeature.js.map