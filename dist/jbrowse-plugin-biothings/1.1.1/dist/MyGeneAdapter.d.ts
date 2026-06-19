import PluginManager from '@jbrowse/core/PluginManager';
export declare const configSchema: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    baseUrl: {
        type: string;
        defaultValue: string;
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
export declare function cdsStartEndProcessor(feature: {
    thickStart: number;
    thickEnd: number;
    refName: string;
    strand: number;
    subfeatures: {
        start: number;
        end: number;
    }[];
}): {
    thickStart: number;
    thickEnd: number;
    refName: string;
    strand: number;
    subfeatures: {
        start: number;
        end: number;
    }[];
} | {
    subfeatures: ({
        refName: string;
    } | {
        refName: string;
        type: string;
        start: number;
        end: number;
    } | {
        refName: string;
        type: string;
        start: number;
        end: number;
    } | {
        refName: string;
        type: string;
        start: number;
        end: number;
    })[];
    type: string;
    thickStart: number;
    thickEnd: number;
    refName: string;
    strand: number;
};
export default function MyGeneAdapterF(pluginManager: PluginManager): void;
