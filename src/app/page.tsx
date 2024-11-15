import DailyPlanner from '../components/DailyPlanner';
import dynamic from 'next/dynamic';

const ErrorBoundary = dynamic(() => import('@/components/ErrorBoundary'), {
    ssr: false
});

export default function Home() {
    return (
        <ErrorBoundary>
            <DailyPlanner />
        </ErrorBoundary>
    );
}
