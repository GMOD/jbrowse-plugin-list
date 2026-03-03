import { Instance } from 'mobx-state-tree';
declare const GDCConfigSchema: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    authHeader: {
        description: string;
        type: string;
        defaultValue: string;
    };
    customEndpoint: {
        description: string;
        type: string;
        defaultValue: string;
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    name: {
        description: string;
        type: string;
        defaultValue: string;
    };
    description: {
        description: string;
        type: string;
        defaultValue: string;
    };
    authHeader: {
        description: string;
        type: string;
        defaultValue: string;
    };
    tokenType: {
        description: string;
        type: string;
        defaultValue: string;
    };
    domains: {
        description: string;
        type: string;
        defaultValue: never[];
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "internetAccountId">>, undefined>>;
export type GDCInternetAccountConfigModel = typeof GDCConfigSchema;
export type OAuthInternetAccountConfig = Instance<GDCInternetAccountConfigModel>;
export default GDCConfigSchema;
