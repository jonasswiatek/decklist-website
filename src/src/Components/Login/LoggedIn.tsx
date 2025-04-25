import { ReactNode, useEffect } from 'react';
import { useAuth } from './useAuth';
import { LoadingScreen } from './LoadingScreen';

export const LoggedIn = (props: {children: ReactNode}) => {
    const { login, authorized } = useAuth();

    useEffect(() => {
        if (!authorized)
            login();
        
    }, [login, authorized]);

    if (authorized)
        return props.children;
    else if (authorized === null)
        return <LoadingScreen />;
};