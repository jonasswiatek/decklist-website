export type MeResponse = {
    authorized: boolean;
    email?: string;
}

export async function meRequest(): Promise<MeResponse> {
    const httpResponse = await fetch("/api/me");
    if (httpResponse.status === 401) 
        return Promise.resolve<MeResponse>({authorized: false})
    
    if (httpResponse.ok) {
        const me = await httpResponse.json() as MeResponse;
        return me;
    }

    throw new Error("Http Exception");
}

export type StartLoginRequest = {
    email: string;
}

export async function startLoginRequest(data: StartLoginRequest) {
    const httpResponse = await fetch("/api/login/start", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: data.email,
        })
    });

    await ThrowIfValidationErrors(httpResponse);

    if (httpResponse.ok) {
        const response = await httpResponse.json() as LoginStartResponse
        return response;
    }

    throw new Error("Http Exception");
}

export type ContinueLoginRequest = {
    email: string;
    code: string;
}

export async function continueLoginRequest(data: ContinueLoginRequest) {
    const httpResponse = await fetch("/api/login/continue", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: data.email,
            code: data.code
        })
    });

    await ThrowIfValidationErrors(httpResponse);
    
    if(httpResponse.ok) {
        const res = await httpResponse.json() as LoginContinueResponse;
        return res;
    }

    throw new Error("Http Exception");
}

export async function logoutRequest() {
    const httpResponse = await fetch("/api/logout", {
        method: "POST",
    });

    if (httpResponse.ok) {
        return;
    }

    throw new Error("Http Exception");
}

export async function getAllEventsRequest() {
    const httpResponse = await fetch("/api/events");
    if (httpResponse.status === 401) 
        throw new NotAuthenticatedError();
    
    if (httpResponse.ok) {
        const events = await httpResponse.json() as Event[];
        return events;
    }

    throw new Error("Http Exception");
}

export type Event = {
    event_name: string;
    event_id: string;
    format: string;
    role: string;
    event_date: Date;
}

export type EventDetails = {
    event_name: string;
    event_id: string;
    format: string;
    role: string;
    event_date: Date;
    status: string;
    joined: boolean;
}


export type LoginStartResponse = {
    success: boolean,
    notification: string
}

export type LoginContinueResponse = {
    success: boolean,
    error_type: string
}

export type ValidationErrorResponse = {
    title: string,
    status: number,
    errors: { [index:string] : string[] }
}

async function ThrowIfValidationErrors(response: Response) {
    if (response.status == 400 && response.headers.get("Content-Type") === "application/problem+json; charset=utf-8") {
        const errors = await response.json() as ValidationErrorResponse;
        throw new ValidationError(errors);
    }
}

export class ValidationError extends Error {
    public ValidationError: ValidationErrorResponse;

    constructor(errors: ValidationErrorResponse) {
        super(errors.title);
        this.ValidationError = errors;
    }
}

export class NotAuthenticatedError extends Error {

}