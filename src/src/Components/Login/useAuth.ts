import { createContext, useContext } from 'react';

export type AuthContextType = {
    authorized?: boolean,
    email?: string,
    login: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}
