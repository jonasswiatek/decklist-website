import { ReactNode } from 'react';
import { AuthState, useDecklistStore } from '../../store/deckliststore';
import { LoginScreen } from './Login';

export const LoggedIn = (props: {children: ReactNode}) => {
    const { authState } = useDecklistStore();

    switch (authState) {
        case AuthState.Authorized:
            return props.children;

        case AuthState.Unauthorized:
            return <LoginScreen />
    }
};