import type { UriLocation } from '@jbrowse/core/util/types';
import type { Instance } from '@jbrowse/mobx-state-tree';
import type { GDCInternetAccountConfigModel } from './configSchema';
declare const stateModelFactory: (configSchema: GDCInternetAccountConfigModel) => import("@jbrowse/mobx-state-tree").IModelType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    configuration: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
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
    }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "internetAccountId">>;
} & {
    id: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"GDCInternetAccount">;
    configuration: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
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
}, {
    readonly name: string;
    readonly description: string;
    readonly internetAccountId: string;
    readonly authHeader: string;
    readonly tokenType: string;
    readonly domains: string[];
    readonly toggleContents: React.ReactNode;
    readonly SelectorComponent: import("@jbrowse/core/util").AnyReactComponentType | undefined;
    readonly selectorLabel: string | undefined;
} & {
    handlesLocation(location: UriLocation): boolean;
    readonly tokenKey: string;
} & {
    getTokenFromUser(_resolve: (token: string) => void, _reject: (error: Error) => void): void;
    storeToken(token: string): void;
    removeToken(): void;
    retrieveToken(): string | null;
    validateToken(token: string, _loc: UriLocation): Promise<string>;
} & {
    getToken(location?: UriLocation): Promise<string>;
} & {
    addAuthHeaderToInit(init?: RequestInit, token?: string): {
        headers: Headers;
        body?: BodyInit | null;
        cache?: RequestCache;
        credentials?: RequestCredentials;
        integrity?: string;
        keepalive?: boolean;
        method?: string;
        mode?: RequestMode;
        priority?: RequestPriority;
        redirect?: RequestRedirect;
        referrer?: string;
        referrerPolicy?: ReferrerPolicy;
        signal?: AbortSignal | null;
        window?: null;
    };
    getPreAuthorizationInformation(location: UriLocation): Promise<{
        internetAccountType: string;
        authInfo: {
            token: string;
            configuration: any;
        };
    }>;
} & {
    getFetcher(loc?: UriLocation): (input: RequestInfo, init?: RequestInit) => Promise<Response>;
} & {
    openLocation(location: UriLocation): import("@jbrowse/core/util/io").RemoteFileWithRangeCache;
} & {
    needsToken: boolean;
} & {
    readonly authHeader: string;
    readonly customEndpoint: string;
    readonly internetAccountType: string;
} & {
    setNeedsToken(bool: boolean): void;
} & {
    getTokenFromUser(resolve: (token: string) => void, reject: (error: Error) => void): void;
    getFetcher(location?: UriLocation): (input: RequestInfo, init?: RequestInit) => Promise<Response>;
} & {
    /**
     * uses the location of the resource to fetch the 'metadata' of the
     * file, which contains the index files (if applicable) and the
     * property 'controlled' which determines whether the user needs a
     * token to be checked against the resource or not. if controlled =
     * false, then the user will not be prompted with a token dialogue
     *
     * @param location the uri location of the resource to be fetched
     */
    getToken(location?: UriLocation): Promise<string>;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
export default stateModelFactory;
export type ExternalTokenStateModel = ReturnType<typeof stateModelFactory>;
export type ExternalTokenModel = Instance<ExternalTokenStateModel>;
