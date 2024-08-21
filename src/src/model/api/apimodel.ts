type MeResponse = {
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

type StartLoginRequest = {
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

type ContinueLoginRequest = {
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

type CreateEventRequest = {
    event_name: string;
    format: string;
    event_date: Date;
}

type CreateEventResponse = {
    success: boolean,
    event_id: string
}

export async function createEventRequest(data: CreateEventRequest) {
    const httpResponse = await fetch("/api/events", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event_name: data.event_name,
            format: data.format,
            event_date: data.event_date
        })
    });

    await ThrowIfValidationErrors(httpResponse);
    
    if(httpResponse.ok) {
        const res = await httpResponse.json() as CreateEventResponse;
        return res;
    }

    throw new Error("Http Exception");
}

type JoinEventRequest = {
    event_id: string
}

export async function joinEventRequest(data: JoinEventRequest) {
    const httpResponse = await fetch(`/api/events/${data.event_id}/join`, {
        method: "POST",
    });

    await ThrowIfValidationErrors(httpResponse);
    
    if(httpResponse.ok) {
        return;
    }

    throw new Error("Http Exception");
}

type UpdateEventUsersRequest = {
    event_id: string,
    email: string,
    role: "judge" | "none"
}

export async function updateEventUsers(data: UpdateEventUsersRequest) {
    const httpResponse = await fetch(`/api/events/${data.event_id}/users`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: data.email,
            role: data.role
        })
    });

    await ThrowIfValidationErrors(httpResponse);
    
    if(httpResponse.ok) {
        return;
    }

    throw new Error("Http Exception");
}


export type EventListItem = {
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
    participants: EventParticipant[]
}

type EventParticipant = {
    email: string,
    role: string
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