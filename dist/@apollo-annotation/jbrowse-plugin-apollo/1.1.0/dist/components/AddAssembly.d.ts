import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface AddAssemblyProps {
    session: ApolloSessionModel;
    handleClose(): void;
    changeManager: ChangeManager;
}
export declare function AddAssembly({ changeManager, handleClose, session, }: AddAssemblyProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AddAssembly.d.ts.map