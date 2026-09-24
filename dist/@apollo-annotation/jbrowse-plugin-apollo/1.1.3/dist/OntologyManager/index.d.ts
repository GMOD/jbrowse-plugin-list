import { LocalPathLocation, UriLocation } from '@jbrowse/core/util/types/mst';
import { type Instance } from '@jbrowse/mobx-state-tree';
import OntologyStore, { type OntologyStoreOptions } from './OntologyStore';
export { isDeprecated } from './OntologyStore/indexeddb-schema';
export declare const OntologyRecordType: import("@jbrowse/mobx-state-tree").IModelType<{
    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    version: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
    source: import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "UriLocation";
        uri: string;
        baseUri: string | undefined;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
            internetAccountType: string;
            authInfo: any;
        }> | undefined;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "BlobLocation";
        name: string;
        blobId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "LocalPathLocation";
        localPath: string;
    }>, {
        locationType: "UriLocation";
        uri: string;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }> | undefined;
    } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | ({
        locationType: "UriLocation";
        uri: string;
    } & Partial<{
        locationType: "UriLocation";
        uri: string;
        baseUri: string | undefined;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
            internetAccountType: string;
            authInfo: any;
        }> | undefined;
    }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>;
    options: import("@jbrowse/mobx-state-tree").IType<OntologyStoreOptions, OntologyStoreOptions, OntologyStoreOptions>;
    equivalentTypes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
}, {
    dataStore: undefined | OntologyStore;
    startedEquivalentTypeRequests: Set<string>;
} & {
    /** does nothing, just used to access the model to force its lifecycle hooks to run */
    ping(): void;
    initDataStore(): void;
    afterCreate(): void;
    setEquivalentTypes(type: string, equivalentTypes: string[]): void;
} & {
    loadEquivalentTypes: (type: string) => Promise<void>;
} & {
    afterCreate(): void;
    setEquivalentTypes(type: string, equivalentTypes: string[]): void;
} & {
    isTypeOf(queryType: string, typeOf: string): boolean;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
export declare const OntologyManagerType: import("@jbrowse/mobx-state-tree").IModelType<{
    ontologies: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        version: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
        source: import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "BlobLocation";
            name: string;
            blobId: string;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "LocalPathLocation";
            localPath: string;
        }>, {
            locationType: "UriLocation";
            uri: string;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
            }> | undefined;
        } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | ({
            locationType: "UriLocation";
            uri: string;
        } & Partial<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>;
        options: import("@jbrowse/mobx-state-tree").IType<OntologyStoreOptions, OntologyStoreOptions, OntologyStoreOptions>;
        equivalentTypes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
    }, {
        dataStore: undefined | OntologyStore;
        startedEquivalentTypeRequests: Set<string>;
    } & {
        /** does nothing, just used to access the model to force its lifecycle hooks to run */
        ping(): void;
        initDataStore(): void;
        afterCreate(): void;
        setEquivalentTypes(type: string, equivalentTypes: string[]): void;
    } & {
        loadEquivalentTypes: (type: string) => Promise<void>;
    } & {
        afterCreate(): void;
        setEquivalentTypes(type: string, equivalentTypes: string[]): void;
    } & {
        isTypeOf(queryType: string, typeOf: string): boolean;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    prefixes: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>, [undefined]>;
}, {
    readonly featureTypeOntologyName: string;
} & {
    /**
     * gets the OntologyRecord for the ontology we should be
     * using for feature types (e.g. SO or maybe biotypes)
     **/
    readonly featureTypeOntology: ({
        name: string;
        version: string;
        source: ({
            locationType: "BlobLocation";
            name: string;
            blobId: string;
        } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "BlobLocation";
            name: string;
            blobId: string;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "LocalPathLocation";
            localPath: string;
        }>, {
            locationType: "UriLocation";
            uri: string;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
            }> | undefined;
        } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | ({
            locationType: "UriLocation";
            uri: string;
        } & Partial<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
            locationType: "LocalPathLocation";
            localPath: string;
        } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "BlobLocation";
            name: string;
            blobId: string;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "LocalPathLocation";
            localPath: string;
        }>, {
            locationType: "UriLocation";
            uri: string;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
            }> | undefined;
        } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | ({
            locationType: "UriLocation";
            uri: string;
        } & Partial<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
            locationType: "UriLocation";
            uri: string;
        } & Partial<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "BlobLocation";
            name: string;
            blobId: string;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "LocalPathLocation";
            localPath: string;
        }>, {
            locationType: "UriLocation";
            uri: string;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
            }> | undefined;
        } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | ({
            locationType: "UriLocation";
            uri: string;
        } & Partial<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>);
        options: OntologyStoreOptions & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IType<OntologyStoreOptions, OntologyStoreOptions, OntologyStoreOptions>>;
        equivalentTypes: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>>;
    } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
        dataStore: undefined | OntologyStore;
        startedEquivalentTypeRequests: Set<string>;
    } & {
        /** does nothing, just used to access the model to force its lifecycle hooks to run */
        ping(): void;
        initDataStore(): void;
        afterCreate(): void;
        setEquivalentTypes(type: string, equivalentTypes: string[]): void;
    } & {
        loadEquivalentTypes: (type: string) => Promise<void>;
    } & {
        afterCreate(): void;
        setEquivalentTypes(type: string, equivalentTypes: string[]): void;
    } & {
        isTypeOf(queryType: string, typeOf: string): boolean;
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        version: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
        source: import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "BlobLocation";
            name: string;
            blobId: string;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "LocalPathLocation";
            localPath: string;
        }>, {
            locationType: "UriLocation";
            uri: string;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
            }> | undefined;
        } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | ({
            locationType: "UriLocation";
            uri: string;
        } & Partial<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>;
        options: import("@jbrowse/mobx-state-tree").IType<OntologyStoreOptions, OntologyStoreOptions, OntologyStoreOptions>;
        equivalentTypes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
    }, {
        dataStore: undefined | OntologyStore;
        startedEquivalentTypeRequests: Set<string>;
    } & {
        /** does nothing, just used to access the model to force its lifecycle hooks to run */
        ping(): void;
        initDataStore(): void;
        afterCreate(): void;
        setEquivalentTypes(type: string, equivalentTypes: string[]): void;
    } & {
        loadEquivalentTypes: (type: string) => Promise<void>;
    } & {
        afterCreate(): void;
        setEquivalentTypes(type: string, equivalentTypes: string[]): void;
    } & {
        isTypeOf(queryType: string, typeOf: string): boolean;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
    findOntology(name: string, version?: string): ({
        name: string;
        version: string;
        source: ({
            locationType: "BlobLocation";
            name: string;
            blobId: string;
        } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "BlobLocation";
            name: string;
            blobId: string;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "LocalPathLocation";
            localPath: string;
        }>, {
            locationType: "UriLocation";
            uri: string;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
            }> | undefined;
        } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | ({
            locationType: "UriLocation";
            uri: string;
        } & Partial<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
            locationType: "LocalPathLocation";
            localPath: string;
        } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "BlobLocation";
            name: string;
            blobId: string;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "LocalPathLocation";
            localPath: string;
        }>, {
            locationType: "UriLocation";
            uri: string;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
            }> | undefined;
        } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | ({
            locationType: "UriLocation";
            uri: string;
        } & Partial<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
            locationType: "UriLocation";
            uri: string;
        } & Partial<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "BlobLocation";
            name: string;
            blobId: string;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "LocalPathLocation";
            localPath: string;
        }>, {
            locationType: "UriLocation";
            uri: string;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
            }> | undefined;
        } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | ({
            locationType: "UriLocation";
            uri: string;
        } & Partial<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>);
        options: OntologyStoreOptions & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IType<OntologyStoreOptions, OntologyStoreOptions, OntologyStoreOptions>>;
        equivalentTypes: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>>;
    } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
        dataStore: undefined | OntologyStore;
        startedEquivalentTypeRequests: Set<string>;
    } & {
        /** does nothing, just used to access the model to force its lifecycle hooks to run */
        ping(): void;
        initDataStore(): void;
        afterCreate(): void;
        setEquivalentTypes(type: string, equivalentTypes: string[]): void;
    } & {
        loadEquivalentTypes: (type: string) => Promise<void>;
    } & {
        afterCreate(): void;
        setEquivalentTypes(type: string, equivalentTypes: string[]): void;
    } & {
        isTypeOf(queryType: string, typeOf: string): boolean;
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        version: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
        source: import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "BlobLocation";
            name: string;
            blobId: string;
        }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
            locationType: "LocalPathLocation";
            localPath: string;
        }>, {
            locationType: "UriLocation";
            uri: string;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
            }> | undefined;
        } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
            locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
            localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}> | ({
            locationType: "UriLocation";
            uri: string;
        } & Partial<{
            locationType: "UriLocation";
            uri: string;
            baseUri: string | undefined;
            internetAccountId: string | undefined;
            internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                internetAccountType: string;
                authInfo: any;
            }> | undefined;
        }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>;
        options: import("@jbrowse/mobx-state-tree").IType<OntologyStoreOptions, OntologyStoreOptions, OntologyStoreOptions>;
        equivalentTypes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
    }, {
        dataStore: undefined | OntologyStore;
        startedEquivalentTypeRequests: Set<string>;
    } & {
        /** does nothing, just used to access the model to force its lifecycle hooks to run */
        ping(): void;
        initDataStore(): void;
        afterCreate(): void;
        setEquivalentTypes(type: string, equivalentTypes: string[]): void;
    } & {
        loadEquivalentTypes: (type: string) => Promise<void>;
    } & {
        afterCreate(): void;
        setEquivalentTypes(type: string, equivalentTypes: string[]): void;
    } & {
        isTypeOf(queryType: string, typeOf: string): boolean;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
    openOntology(name: string, version?: string): OntologyStore | undefined;
    /**
     * compact the given URI using the currently configured
     * prefixes
     */
    applyPrefixes(uri: string): string;
    /**
     * expand the given compacted URI using the currently
     * configured prefixes
     */
    expandPrefixes(uri: string): string;
} & {
    addOntology(name: string, version: string, source: Instance<typeof LocalPathLocation> | Instance<typeof UriLocation>, options?: OntologyStoreOptions): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
export default OntologyManagerType;
export type { OntologyClass, OntologyProperty, OntologyTerm, TextIndexFieldDefinition, } from './OntologyStore/types';
export { defaultTextIndexFields, isOntologyClass, isOntologyProperty, } from './OntologyStore/types';
export declare const OntologyRecordConfiguration: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    name: {
        type: string;
        description: string;
        defaultValue: string;
    };
    version: {
        type: string;
        description: string;
        defaultValue: string;
    };
    source: {
        type: string;
        description: string;
        defaultValue: {
            locationType: string;
            uri: string;
        };
    };
    textIndexFields: {
        type: string;
        description: string;
        defaultValue: import("./OntologyStore/types").TextIndexFieldDefinition[];
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
export interface OntologyManager extends Instance<typeof OntologyManagerType> {
}
export interface OntologyRecord extends Instance<typeof OntologyRecordType> {
}
//# sourceMappingURL=index.d.ts.map