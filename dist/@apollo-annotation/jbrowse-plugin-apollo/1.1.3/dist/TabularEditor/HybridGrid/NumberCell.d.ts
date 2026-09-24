interface NumberCellProps {
    initialValue: number;
    notifyError(error: Error): void;
    onChangeCommitted(newValue: number): Promise<void>;
}
export declare const NumberCell: ({ initialValue, notifyError, onChangeCommitted, }: NumberCellProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=NumberCell.d.ts.map