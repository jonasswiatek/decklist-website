import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { AuthState, useDecklistStore } from '../../store/deckliststore';
import { LoginScreen } from './Login';
import { LoadingScreen } from './LoadingScreen';
import { AuthContext } from './useAuth';

export const AuthProvider = (props: { children: ReactNode }): ReactElement => {
    const { authState, checkAuth, email } = useDecklistStore();
    const [showLogin, setShowLogin] = useState(false);
  
    useEffect(() => {
      if (authState === AuthState.Loading) {
        checkAuth();
      }

      if (authState === AuthState.Authorized)
        setShowLogin(false);

    }, [authState, checkAuth, setShowLogin]);
  
    if (authState === AuthState.Loading) {
      return <LoadingScreen />;
    }
  
    if (showLogin && authState === AuthState.Unauthorized) {
      return <LoginScreen />;
    }

    const login = () => {
      setShowLogin(true);
    };

    return <AuthContext.Provider {...props} value={{ 
        login,
        authorized: authState === AuthState.Authorized,
        email: email
    }} />;
};
