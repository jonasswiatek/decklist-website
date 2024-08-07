import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Event, LoginContinueResponse, LoginStartResponse } from '../model/api/apimodel';

var baseUrl = "http://localhost:5156";

type DecklistStore = {
  isLoggedIn: boolean | null;
  events: Event[];
  pendingLoginEmail: string | null;
}

type Actions = {
    startLogin: (email: string) => Promise<void>;
    continueLogin: (email: string, code: string) => Promise<void>;
    logout: () => Promise<void>;
    loadEvents: () => Promise<void>;
    reset: () => void
  }
  

const initialState: DecklistStore = {
    events: [],
    isLoggedIn: null,
    pendingLoginEmail: null,
}
  

export const useDecklistStore = create<DecklistStore & Actions>()(
    (set) => ({
        ...initialState,
        startLogin: async (email) => 
        {
            let res = await fetch("/api/login/start", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                })
            });

            if (res.ok) {
                var data = await res.json() as LoginStartResponse
                if (data.success)
                    set({pendingLoginEmail: email});
            }
        },
        continueLogin: async (email, code) => 
        {
            let resp = await fetch("/api/login/continue", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    code: code
                })
            });
            
            var res = await resp.json() as LoginContinueResponse;
            if (res.success) {
                set({pendingLoginEmail: null, isLoggedIn: true});
            }
        },
        logout: async() => {
            let resp = await fetch("/api/logout", {
                method: "POST",
            });

            if (resp.ok) {
                set(initialState);
            }
        },
        loadEvents: async () => {
            let res = await fetch("/api/events");
            if (res.status === 401) 
            {
                set({isLoggedIn: false});
            }
            else
            {
                set({
                    isLoggedIn: true,
                    events: await res.json()
                });
            }
        },
        reset: () => {
            set(initialState)
        },
    })
)