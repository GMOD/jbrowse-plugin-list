import type { ApolloSessionModel } from '../session';
interface FilterFeaturesProps {
    onUpdate: (types: string[]) => void;
    featureTypes: string[];
    handleClose: () => void;
    session: ApolloSessionModel;
}
export declare const FilterFeatures: ({ featureTypes, handleClose, onUpdate, session, }: FilterFeaturesProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FilterFeatures.d.ts.map