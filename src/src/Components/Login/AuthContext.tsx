import { createContext, ReactElement, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthState, useDecklistStore } from '../../store/deckliststore';
import { LoginScreen } from './Login';

type AuthContextType = {
    authorized?: boolean,
    email?: string,
    login: () => void
}

export interface AuthedReactElement {
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}

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
      return (<p>Loading...</p>)
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
