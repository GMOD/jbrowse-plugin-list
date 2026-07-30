import { type UserLocation } from '@apollo-annotation/shared';
import { type UriLocation } from '@jbrowse/core/util';
import { type Instance } from '@jbrowse/mobx-state-tree';
import type { ApolloInternetAccountConfigModel } from './configSchema';
type Role = 'admin' | 'user' | 'readOnly' | 'none';
declare const stateModelFactory: (configSchema: ApolloInternetAccountConfigModel) => import("@jbrowse/mobx-state-tree").IModelType<{
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
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"ApolloInternetAccount">;
    configuration: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
        baseURL: {
            description: string;
            type: string;
            defaultValue: string;
        };
        tokenType: {
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
    readonly toggleContents: import("react").ReactNode;
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
    readonly baseURL: string;
    getUserId(): string | undefined;
} & {
    role: Role | undefined;
    controller: AbortController;
    tokenPromise: Promise<string> | undefined;
} & {
    setRole(): void;
} & {
    getFetcher(loc?: UriLocation): (input: RequestInfo, init?: RequestInit) => Promise<Response>;
} & {
    removeToken(): void;
} & {
    getToken(location?: UriLocation): Promise<string>;
} & {
    addMessageChannel(resolve: (token: string) => void, reject: (error: Error) => void): void;
    deleteMessageChannel(): void;
    finishOAuthWindow(event: MessageEvent, resolve: (token: string) => void, reject: (error: Error) => void): void;
    openAuthWindow(type: string, resolve: (token: string) => void, reject: (error: Error) => void): Promise<void>;
} & {
    getTokenFromUser(resolve: (token: string) => void, reject: (error: Error) => void): Promise<void>;
} & {
    lastChangeSequenceNumber: number | undefined;
} & {
    setLastChangeSequenceNumber(sequenceNumber: number): void;
} & {
    updateLastChangeSequenceNumber: () => Promise<void>;
    getMissingChanges: () => Promise<void>;
} & {
    socket: import("socket.io-client").Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>;
} & {
    addSocketListeners(): void;
} & {
    postUserLocation: (userLocation: UserLocation[]) => void;
} & {
    roleNotificationSent: boolean;
} & {
    initialize: (role: Role) => Promise<void>;
    removeBeforeUnloadListener(): void;
    removeVisibilityChangeListener(): void;
} & {
    afterAttach(): void;
    beforeDestroy(): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
export default stateModelFactory;
export type ApolloInternetAccountStateModel = ReturnType<typeof stateModelFactory>;
export interface ApolloInternetAccountModel extends Instance<ApolloInternetAccountStateModel> {
}
//# sourceMappingURL=model.d.ts.map