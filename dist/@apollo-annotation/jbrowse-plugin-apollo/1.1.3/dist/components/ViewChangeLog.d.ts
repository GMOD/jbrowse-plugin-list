import type { ApolloSessionModel } from '../session';
interface ViewChangeLogProps {
    session: ApolloSessionModel;
    handleClose(): void;
    assembly: string;
}
export declare function ViewChangeLog({ handleClose, session, assembly: assemblyId, }: ViewChangeLogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ViewChangeLog.d.ts.map