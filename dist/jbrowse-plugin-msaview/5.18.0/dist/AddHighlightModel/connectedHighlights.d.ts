interface Region {
    refName: string;
    start: number;
    end: number;
}
export declare function connectedHighlights(views: readonly {
    type: string;
}[], genomeViewId: string, genomeHovered: boolean): Region[];
export {};
