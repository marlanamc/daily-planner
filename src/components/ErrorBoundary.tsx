class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div>Something went wrong. Please refresh the page.</div>;
        }
        if (this.state.hasError) {
            return (
                <div className="error-boundary p-4 m-4 border border-red-500 rounded bg-red-100">
                    <h2 className="text-red-700 text-lg font-bold mb-2">Something went wrong</h2>
                    <details className="text-red-600">
                        {this.state.error && this.state.error.toString()}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

// Use it in your app:
<ErrorBoundary>
    <DailyPlanner />
</ErrorBoundary> 