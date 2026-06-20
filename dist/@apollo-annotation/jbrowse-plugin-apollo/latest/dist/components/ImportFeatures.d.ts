import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface ImportFeaturesProps {
    session: ApolloSessionModel;
    handleClose(): void;
    changeManager: ChangeManager;
}
export declare function ImportFeatures({ changeManager, handleClose, session, }: ImportFeaturesProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ImportFeatures.d.ts.map