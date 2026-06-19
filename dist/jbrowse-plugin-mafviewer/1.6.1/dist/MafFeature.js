/**
 * Lightweight Feature implementation for MAF alignments.
 * Avoids SimpleFeature overhead (validation, data Record, spreads).
 */
export default class MafFeature {
    _id;
    _start;
    _end;
    _refName;
    _strand;
    _alignments;
    _seq;
    constructor(id, start, end, refName, strand, alignments, seq) {
        this._id = id;
        this._start = start;
        this._end = end;
        this._refName = refName;
        this._strand = strand;
        this._alignments = alignments;
        this._seq = seq;
    }
    get(name) {
        switch (name) {
            case 'start':
                return this._start;
            case 'end':
                return this._end;
            case 'refName':
                return this._refName;
            case 'strand':
                return this._strand;
            case 'alignments':
                return this._alignments;
            case 'seq':
                return this._seq;
            default:
                return undefined;
        }
    }
    id() {
        return this._id;
    }
    toJSON() {
        return {
            uniqueId: this._id,
            start: this._start,
            end: this._end,
            refName: this._refName,
            strand: this._strand,
            alignments: this._alignments,
            seq: this._seq,
        };
    }
}
//# sourceMappingURL=MafFeature.js.map