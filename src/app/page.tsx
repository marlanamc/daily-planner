import DailyPlanner from '../components/DailyPlanner';
import ErrorBoundaryWrapper from '@/components/ErrorBoundaryWrapper';

export default function Home() {
    return (
        <ErrorBoundaryWrapper>
            <DailyPlanner />
        </ErrorBoundaryWrapper>
    );
}
