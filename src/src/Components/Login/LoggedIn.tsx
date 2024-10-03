import { ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const LoggedIn = (props: {children: ReactNode}) => {
    const { login, authorized } = useAuth();

    useEffect(() => {
        if (!authorized)
            login();
        
    }, [login, authorized]);

    if (authorized)
        return props.children;
};