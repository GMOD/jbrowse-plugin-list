import { type TextFieldProps } from '@mui/material';
interface StringTextFieldProps extends Omit<TextFieldProps, 'type' | 'onChange' | 'onKeyDown' | 'onBlur' | 'ref'> {
    onChangeCommitted(newValue: string): void;
    value: unknown;
}
export declare const StringTextField: ({ onChangeCommitted, value: initialValue, ...props }: StringTextFieldProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=StringTextField.d.ts.map