import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthQuery } from '../../Hooks/useAuthQuery';
import { LoadingScreen } from './LoadingScreen';

export const ProtectedLayout = () => {
    const { authorized, isLoading, isError, refetch } = useAuthQuery();
    const location = useLocation();

    if (isLoading)
        return <LoadingScreen />;

    if (isError)
        return (
            <div className="container py-5 text-center">
                <h4>Something went wrong</h4>
                <p className="text-muted">Unable to verify your session. Please try again later.</p>
                <button className="btn btn-primary" onClick={() => refetch()}>Retry</button>
            </div>
        );

    if (!authorized)
        return <Navigate to={`/login?return=${encodeURIComponent(location.pathname + location.search)}`} replace />;

    return <Outlet />;
};
