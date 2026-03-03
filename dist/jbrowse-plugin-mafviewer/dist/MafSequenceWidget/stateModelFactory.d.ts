import type { Sample } from '../types';
import type { Instance } from '@jbrowse/mobx-state-tree';
export interface HoverHighlight {
    refName: string;
    start: number;
    end: number;
    assemblyName: string;
}
export declare function stateModelFactory(): import("@jbrowse/mobx-state-tree").IModelType<{
    id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"MafSequenceWidget">;
    adapterConfig: import("@jbrowse/mobx-state-tree").IType<({
        [x: string]: any;
    } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
        setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
            [x: string]: any;
        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
            setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                [x: string]: any;
            } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & any & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>) | null | undefined, ({
        [x: string]: any;
    } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
        setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
            [x: string]: any;
        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
            setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                [x: string]: any;
            } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & any & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>) | undefined, ({
        [x: string]: any;
    } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
        setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
            [x: string]: any;
        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
            setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                [x: string]: any;
            } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & any & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>) | undefined>;
    samples: import("@jbrowse/mobx-state-tree").IType<Sample[] | null | undefined, Sample[] | undefined, Sample[] | undefined>;
    regions: import("@jbrowse/mobx-state-tree").IType<{
        refName: string;
        start: number;
        end: number;
        assemblyName: string;
    }[] | null | undefined, {
        refName: string;
        start: number;
        end: number;
        assemblyName: string;
    }[] | undefined, {
        refName: string;
        start: number;
        end: number;
        assemblyName: string;
    }[] | undefined>;
    connectedViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
}, {
    hoverHighlight: HoverHighlight | undefined;
} & {
    setHoverHighlight(highlight: HoverHighlight | undefined): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
export type MafSequenceWidgetStateModel = ReturnType<typeof stateModelFactory>;
export type MafSequenceWidgetModel = Instance<MafSequenceWidgetStateModel>;
