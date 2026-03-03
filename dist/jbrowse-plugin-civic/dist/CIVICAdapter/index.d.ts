export const configSchema: import("@jbrowse/core/configuration").AnyConfigurationSchemaType;
export class AdapterClass extends BaseFeatureDataAdapter {
    constructor(config?: (import("mobx-state-tree").ModelInstanceTypeProps<Record<string, any>> & {
        setSubschema(slotName: string, data: unknown): any;
    } & import("mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>) | undefined, getSubAdapter?: import("@jbrowse/core/data_adapters/dataAdapterCache").getSubAdapterType | undefined, pluginManager?: import("@jbrowse/core/PluginManager").default | undefined);
    fetchFeatures(): Promise<any>;
    setup(): Promise<any>;
    setupP: Promise<any> | undefined;
    formatFeature(data: any): SimpleFeature | undefined;
}
import { BaseFeatureDataAdapter } from "@jbrowse/core/data_adapters/BaseAdapter";
import SimpleFeature from "@jbrowse/core/util/simpleFeature";
