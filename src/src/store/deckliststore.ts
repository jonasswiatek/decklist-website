import { create } from 'zustand'
import { Event, LoginContinueResponse, LoginStartResponse, ValidationErrorResponse } from '../model/api/apimodel';

type DecklistStore = {
    isLoggedIn: boolean | null;
    events: Event[];
    pendingLoginEmail: string | null;
}

type Actions = {
    startLogin: (email: string) => Promise<void>;
    continueLogin: (email: string, code: string) => Promise<LoginContinueResponse>;
    logout: () => Promise<void>;
    loadEvents: () => Promise<void>;
    reset: () => void
}
  
const initialState: DecklistStore = {
    events: [],
    isLoggedIn: null,
    pendingLoginEmail: null,
}

export class ValidationError extends Error {
    public Errors: ValidationErrorResponse;

    constructor(errors: ValidationErrorResponse) {
        super(errors.title);
        this.Errors = errors;
    }
}

async function ThrowIfValidationErrors(response: Response) {
    if (response.status == 400 && response.headers.get("Content-Type") === "application/problem+json; charset=utf-8") {
        var errors = await response.json() as ValidationErrorResponse;
        throw new ValidationError(errors);
    }
}

export const useDecklistStore = create<DecklistStore & Actions>()(
    (set) => ({
        ...initialState,
        startLogin: async (email) => 
        {
            let httpResponse = await fetch("/api/login/start", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                })
            });

            await ThrowIfValidationErrors(httpResponse);

            if (httpResponse.ok) {
                var data = await httpResponse.json() as LoginStartResponse
                if (data.success)
                    set({pendingLoginEmail: email});
            }
        },
        continueLogin: async (email, code) => 
        {
            let httpResponse = await fetch("/api/login/continue", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    code: code
                })
            });

            await ThrowIfValidationErrors(httpResponse);
            
            var res = await httpResponse.json() as LoginContinueResponse;
            if (res.success) {
                set({pendingLoginEmail: null, isLoggedIn: true});
            }

            return res;
        },
        logout: async() => {
            let httpResponse = await fetch("/api/logout", {
                method: "POST",
            });

            if (httpResponse.ok) {
                set(initialState);
            }
        },
        loadEvents: async () => {
            let httpResponse = await fetch("/api/events");
            if (httpResponse.status === 401) 
            {
                set({isLoggedIn: false});
            }
            else
            {
                set({
                    isLoggedIn: true,
                    events: await httpResponse.json()
                });
            }
        },
        reset: () => {
            set(initialState)
        },
    })
)