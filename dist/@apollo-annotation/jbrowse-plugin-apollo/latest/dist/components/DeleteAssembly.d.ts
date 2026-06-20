import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface DeleteAssemblyProps {
    session: ApolloSessionModel;
    handleClose(): void;
    changeManager: ChangeManager;
}
export declare function DeleteAssembly({ changeManager, handleClose, session, }: DeleteAssemblyProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DeleteAssembly.d.ts.map