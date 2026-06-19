declare const stateModel: import("mobx-state-tree").IModelType<{
    type: import("mobx-state-tree").ISimpleType<"ReactomeView">;
    displayName: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
    selectedPathway: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
    gene: import("mobx-state-tree").IMaybe<import("mobx-state-tree").ISimpleType<string>>;
    message: import("mobx-state-tree").IType<string | undefined, string, string>;
}, {
    pathways: object;
} & {
    setWidth(): void;
    setDisplayName(str: string): void;
    setPathways(pathways: any): void;
    setSelectedPathway(str: string): void;
    setGene(str: string): void;
    setMessage(str: string): void;
}, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
export default stateModel;
