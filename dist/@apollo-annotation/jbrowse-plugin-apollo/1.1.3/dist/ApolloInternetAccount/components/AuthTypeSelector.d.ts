interface AuthType {
    name: string;
    message: string;
    needsPopup: boolean;
}
export declare const AuthTypeSelector: ({ baseURL, handleClose, name, }: {
    baseURL: string;
    name: string;
    handleClose: (type?: AuthType | Error) => void;
}) => import("react/jsx-runtime").JSX.Element | "Loading…";
export {};
//# sourceMappingURL=AuthTypeSelector.d.ts.map