import React, { Component } from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error('MsaViewPanel error:', error, info.componentStack);
    }
    render() {
        if (this.state.hasError) {
            return (React.createElement("div", { style: { padding: 20 } },
                React.createElement(ErrorMessage, { error: this.state.error })));
        }
        return this.props.children;
    }
}
//# sourceMappingURL=ErrorBoundary.js.map