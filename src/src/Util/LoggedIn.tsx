import { ReactNode } from 'react';
import { Navigate } from "react-router-dom";
import { useDecklistStore } from '../store/deckliststore';

export const LoggedIn = (props: {children: ReactNode}) => {
    const { isLoggedIn } = useDecklistStore();
    console.log('current state', isLoggedIn);
    if (!isLoggedIn) {
        return <Navigate to="/" />
    }

    return props.children;
};