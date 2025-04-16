import { create } from 'zustand'
import { LoginContinueResponse, startLoginRequest, continueLoginRequest, logoutRequest, meRequest, googleLoginRequest } from '../model/api/apimodel';
import { QueryClient } from '@tanstack/react-query';

// Create or import your QueryClient instance
// If you already have a QueryClient defined elsewhere, import it instead
const queryClient = new QueryClient();

export enum AuthState {
    Loading,
    Unauthorized,
    Authorized
}

type DecklistStore = {
    authState: AuthState,
    email?: string,
}

type Actions = {
    checkAuth: () => Promise<void>;
    startLogin: (email: string) => Promise<void>;
    continueLogin: (email: string, code: string) => Promise<LoginContinueResponse>;
    googleLogin: (token: string) => Promise<LoginContinueResponse>;
    logout: () => Promise<void>;
    reset: () => void
}
  
const initialState: DecklistStore = {
    authState: AuthState.Loading,
}

export const useDecklistStore = create<DecklistStore & Actions>()(
    (set) => ({
        ...initialState,
        checkAuth: async () => {
            const me = await meRequest();
            if (me.authorized) {
                set({
                    authState: AuthState.Authorized,
                    email: me.email
                })
            }
            else {
                set({
                    authState: AuthState.Unauthorized,
                    email: undefined
                })
            }
        },
        startLogin: async (email) => 
        {
            await startLoginRequest({email: email});
        },
        continueLogin: async (email, code) => 
        {
            const res = await continueLoginRequest({email, code});
            if (res.success) {
                set({
                    authState: AuthState.Authorized,
                    email: email
                })
            }

            return res;
        },
        googleLogin: async (token) => 
        {
            const res = await googleLoginRequest({token});
            if (res.success) {
                set({
                    authState: AuthState.Authorized,
                    email: res.email
                })
            }

            return res;
        },    
        logout: async() => {
            await logoutRequest();
            
            // Clear React Query cache
            Promise.resolve().then(() => queryClient.clear());
            
            set(initialState);
        },
        reset: () => {
            // Clear React Query cache
            Promise.resolve().then(() => queryClient.clear());
            
            set(initialState)
        },
    })
)