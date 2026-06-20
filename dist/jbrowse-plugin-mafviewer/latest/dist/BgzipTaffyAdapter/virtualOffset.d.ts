export default class VirtualOffset {
    blockPosition: number;
    dataPosition: number;
    constructor(blockPosition: number, dataPosition: number);
    toString(): string;
    compareTo(b: VirtualOffset): number;
}
