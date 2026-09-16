import { BaseAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
export default class BgzipFastaMsaAdapter extends BaseAdapter {
    configureP: Promise<BaseFeatureDataAdapter> | undefined;
    refNamesP: Promise<string[]> | undefined;
    configurePre(): Promise<BaseFeatureDataAdapter<import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<Record<string, any>> & {
        setSubschema(slotName: string, data: Record<string, unknown>): any;
        setSlot(slotName: string, value: unknown): void;
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>>>;
    configure(): Promise<BaseFeatureDataAdapter<import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<Record<string, any>> & {
        setSubschema(slotName: string, data: Record<string, unknown>): any;
        setSlot(slotName: string, value: unknown): void;
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>>>;
    getMSARefs(): Promise<string[]>;
    getMsaRegex(): RegExp;
    refNameToMsaId(refName: string): string;
    getMSAList(): Promise<string[]>;
    getMSA(id: string): Promise<import("@jbrowse/core/util").Feature[]>;
}
