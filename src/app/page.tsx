import DailyPlanner from '../components/DailyPlanner';
import ErrorBoundary from '@/components/ErrorBoundary';


export default function Home() {
  return (
    <ErrorBoundary>
      <DailyPlanner />
    </ErrorBoundary>
  );
}
