import React from 'react';
declare const _default: ({ model }: {
    model: {
        id: string;
        type: "GDCSearchWidget";
    } & import("mobx-state-tree/dist/internal").NonEmptyObject & {
        trackData: import("@jbrowse/core/util").FileLocation | undefined;
        indexTrackData: import("@jbrowse/core/util").FileLocation | undefined;
    } & {
        setTrackData(obj?: import("@jbrowse/core/util").FileLocation | undefined): void;
        setIndexTrackData(obj?: import("@jbrowse/core/util").FileLocation | undefined): void;
        clearData(): void;
    } & import("mobx-state-tree").IStateTreeNode<import("mobx-state-tree").IModelType<{
        id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        type: import("mobx-state-tree").ISimpleType<"GDCSearchWidget">;
    }, {
        trackData: import("@jbrowse/core/util").FileLocation | undefined;
        indexTrackData: import("@jbrowse/core/util").FileLocation | undefined;
    } & {
        setTrackData(obj?: import("@jbrowse/core/util").FileLocation | undefined): void;
        setIndexTrackData(obj?: import("@jbrowse/core/util").FileLocation | undefined): void;
        clearData(): void;
    }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>;
}) => React.JSX.Element;
export default _default;
