
import React, { Component } from 'react';

class ErrorBoundary extends Component<{
    children: React.ReactNode;
}> {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error:Error, info:React.ErrorInfo) {
        console.log(error, info);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}