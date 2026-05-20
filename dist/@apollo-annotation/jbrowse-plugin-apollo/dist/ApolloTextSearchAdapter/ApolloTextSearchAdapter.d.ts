import type { AnnotationFeatureSnapshot } from '@apollo-annotation/mst';
import BaseResult from '@jbrowse/core/TextSearch/BaseResults';
import type { Assembly } from '@jbrowse/core/assemblyManager/assembly';
import { BaseAdapter, type BaseTextSearchAdapter, type BaseTextSearchArgs } from '@jbrowse/core/data_adapters/BaseAdapter';
export declare class ApolloTextSearchAdapter extends BaseAdapter implements BaseTextSearchAdapter {
    get baseURL(): string;
    get trackId(): string;
    get assemblyNames(): string[];
    mapBaseResult(features: AnnotationFeatureSnapshot[], assembly: Assembly, query: string): BaseResult[];
    searchIndex(args: BaseTextSearchArgs): Promise<BaseResult[]>;
    freeResources(): void;
}
//# sourceMappingURL=ApolloTextSearchAdapter.d.ts.map