import type { Structure } from 'molstar/lib/mol-model/structure';
interface HoveredState {
    hoverPosition: {
        coord: number;
        refName: string;
    };
}
export declare function checkHovered(hovered: unknown): hovered is HoveredState;
export declare function getMolstarStructureSelection({ structure, selectedResidue, }: {
    structure: Structure;
    selectedResidue: number;
}): Promise<import("molstar/lib/mol-model/structure").StructureSelection>;
export declare function toStr({ chain, code, structureSeqPos, }: {
    structureSeqPos?: number;
    code?: string;
    chain?: string;
}): string;
export declare function invertMap(arg: Record<number, number>): Record<number, number>;
export {};
