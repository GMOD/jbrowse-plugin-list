export default class GDCFeature {
    constructor(args) {
        this.gdcObject = args.gdcObject;
        this.featureType = args.featureType ? args.featureType : 'mutation';
        this.data = this.dataFromGDCObject(this.gdcObject, this.featureType);
        this.uniqueId = args.id;
    }
    get(field) {
        return this.gdcObject[field] || this.data[field];
    }
    set() { }
    parent() {
        return undefined;
    }
    children() {
        return undefined;
    }
    tags() {
        const t = [...Object.keys(this.data), ...Object.keys(this.gdcObject)];
        return t;
    }
    id() {
        return this.uniqueId;
    }
    dataFromGDCObject(gdcObject, featureType) {
        // Defaults to mutation values
        const featureData = {
            refName: gdcObject.chromosome,
            type: gdcObject.mutationType,
            start: gdcObject.startPosition - 1,
            end: gdcObject.endPosition,
        };
        switch (featureType) {
            case 'gene': {
                featureData.start = gdcObject.geneStart - 1;
                featureData.end = gdcObject.geneEnd;
                featureData.refName = gdcObject.geneChromosome;
                featureData.type = gdcObject.biotype;
                featureData.note = gdcObject.symbol;
                break;
            }
            default:
        }
        return featureData;
    }
    toJSON() {
        return {
            uniqueId: this.uniqueId,
            ...this.data,
            ...this.gdcObject,
        };
    }
}
//# sourceMappingURL=GDCFeature.js.map