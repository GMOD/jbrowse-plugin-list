import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface ManageUsersProps {
    session: ApolloSessionModel;
    handleClose(): void;
    changeManager: ChangeManager;
}
export declare function ManageUsers({ changeManager, handleClose, session, }: ManageUsersProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ManageUsers.d.ts.map