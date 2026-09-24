import type { ApolloSessionModel } from '../session';
export interface AttributeEditorProps {
    session: ApolloSessionModel;
    attributeValues?: string[];
    setAttribute: (newAttribute?: string[]) => void;
    isNew?: boolean;
}
export declare const DefaultAttributeEditor: ({ attributeValues, setAttribute, isNew, }: AttributeEditorProps) => import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=DefaultAttributeEditor.d.ts.map