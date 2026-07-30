import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthQuery } from '../../Hooks/useAuthQuery';
import { LoadingScreen } from './LoadingScreen';
import { Button } from '@/Components/ui/button';

export const ProtectedLayout = () => {
    const { authorized, isLoading, isError, refetch } = useAuthQuery();
    const location = useLocation();

    if (isLoading)
        return <LoadingScreen />;

    if (isError)
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                <h4 className="text-xl font-semibold">Something went wrong</h4>
                <p className="text-muted-foreground">Unable to verify your session. Please try again later.</p>
                <Button onClick={() => refetch()}>Retry</Button>
            </div>
        );

    if (!authorized)
        return <Navigate to={`/login?return=${encodeURIComponent(location.pathname + location.search)}`} replace />;

    return <Outlet />;
};
