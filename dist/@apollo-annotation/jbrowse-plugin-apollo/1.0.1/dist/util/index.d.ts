import type { ApolloInternetAccountModel } from '../ApolloInternetAccount/model';
import type { ApolloSessionModel } from '../session';
export declare function createFetchErrorMessage(response: Response, additionalText?: string): Promise<string>;
/** given a session, get our ApolloInternetAccount */
export declare function getApolloInternetAccount(session: ApolloSessionModel): ApolloInternetAccountModel | undefined;
export * from './annotationFeatureUtils';
export * from './glyphUtils';
export * from './mouseEventsUtils';
//# sourceMappingURL=index.d.ts.map