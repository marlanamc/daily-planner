'use client';

import dynamic from 'next/dynamic';

const ErrorBoundary = dynamic(() => import('./ErrorBoundary'), {
    ssr: false
});

export default function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
    return <ErrorBoundary>{children}</ErrorBoundary>;
} 