import { create } from 'zustand'
import { LoginContinueResponse, startLoginRequest, continueLoginRequest, logoutRequest, meRequest, googleLoginRequest } from '../model/api/apimodel';

export enum AuthState {
    Loading,
    Unauthorized,
    Authorized
}

type DecklistStore = {
    authState: AuthState,
    email?: string | null,
    userId?: string | null,
    sessionId?: string,
    name?: string | null,
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
                    email: me.email,
                    userId: me.user_id,
                    sessionId: me.session_id,
                    name: me.name
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
                    email: res.email,
                    userId: res.user_id,
                    sessionId: res.session_id,
                    name: res.name
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
                    email: res.email,
                    userId: res.user_id,
                    sessionId: res.session_id,
                    name: res.name
                })
            }

            return res;
        },    
        logout: async() => {
            await logoutRequest();            
            set(initialState);
        },
        reset: () => {            
            set(initialState)
        },
    })
)