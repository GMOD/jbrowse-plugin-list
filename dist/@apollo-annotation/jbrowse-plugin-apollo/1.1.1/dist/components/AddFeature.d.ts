import type { Region } from '@jbrowse/core/util/types';
import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface AddFeatureProps {
    session: ApolloSessionModel;
    handleClose(): void;
    region: Region;
    changeManager: ChangeManager;
}
export declare function AddFeature({ changeManager, handleClose, region, session, }: AddFeatureProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AddFeature.d.ts.map