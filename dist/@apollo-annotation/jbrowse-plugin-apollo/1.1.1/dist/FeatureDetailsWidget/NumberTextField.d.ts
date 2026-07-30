import { type TextFieldProps } from '@mui/material';
interface NumberTextFieldProps extends Omit<TextFieldProps, 'type' | 'onChange' | 'onKeyDown' | 'onBlur' | 'ref' | 'error' | 'helperText'> {
    onChangeCommitted(newValue: number): boolean;
    value: unknown;
}
export declare const NumberTextField: ({ onChangeCommitted, value: initialValue, ...props }: NumberTextFieldProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=NumberTextField.d.ts.map