export interface Pathway {
    stId: string;
    name: string;
    leaf: boolean;
}
export interface ReactomeDiagram {
    loadDiagram(stId: string): void;
}
interface ReactomeGlobal {
    Diagram: {
        create(options: {
            placeHolder: string;
            width: number;
            height: number;
            toHide: string[];
        }): ReactomeDiagram;
    };
}
export declare function getPathways(gene: string): Promise<Pathway[]>;
export declare function loadDiagramJs(): Promise<ReactomeGlobal>;
export {};
