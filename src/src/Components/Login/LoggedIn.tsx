import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthQuery } from '../../Hooks/useAuthQuery';
import { LoadingScreen } from './LoadingScreen';

export const ProtectedLayout = () => {
    const { authorized, isLoading } = useAuthQuery();
    const location = useLocation();

    if (isLoading)
        return <LoadingScreen />;

    if (!authorized)
        return <Navigate to={`/login?return=${encodeURIComponent(location.pathname + location.search)}`} replace />;

    return <Outlet />;
};
