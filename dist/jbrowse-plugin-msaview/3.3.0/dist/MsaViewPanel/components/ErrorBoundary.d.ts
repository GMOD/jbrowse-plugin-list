import type { ReactNode } from 'react';
import React, { Component } from 'react';
interface Props {
    children: ReactNode;
}
interface State {
    hasError: boolean;
    error: unknown;
}
export declare class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props);
    static getDerivedStateFromError(error: unknown): {
        hasError: boolean;
        error: unknown;
    };
    componentDidCatch(error: unknown, info: React.ErrorInfo): void;
    render(): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | React.JSX.Element | null | undefined;
}
export {};
