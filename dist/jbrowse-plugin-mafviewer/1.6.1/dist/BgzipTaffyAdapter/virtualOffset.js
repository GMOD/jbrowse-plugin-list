export default class VirtualOffset {
    blockPosition;
    dataPosition;
    constructor(blockPosition, dataPosition) {
        this.blockPosition = blockPosition; // < offset of the compressed data block
        this.dataPosition = dataPosition; // < offset into the uncompressed data
    }
    toString() {
        return `${this.blockPosition}:${this.dataPosition}`;
    }
    compareTo(b) {
        return (this.blockPosition - b.blockPosition || this.dataPosition - b.dataPosition);
    }
}
//# sourceMappingURL=virtualOffset.js.map