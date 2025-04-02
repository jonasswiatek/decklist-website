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

type GoogleLoginRequest = {
    token: string;
}

export async function googleLoginRequest(data: GoogleLoginRequest) {
    const httpResponse = await fetch("/api/login/google", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: data.token,
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

export async function getAllEventsRequest() : Promise<EventDetails[]> {
    const httpResponse = await fetch("/api/events");
    if (httpResponse.status === 401) 
        throw new NotAuthenticatedError();
    
    if (httpResponse.ok) {
        const events = await httpResponse.json() as EventDetails[];
        return events;
    }

    throw new Error("Http Exception");
}

export async function getMultipleEventsRequest(eventId: string[]) : Promise<EventDetails[]> {
    const params = new URLSearchParams();
    eventId.forEach(id => params.append('eventId', id));
    
    const httpResponse = await fetch(`/api/events/batch?${params.toString()}`);
    if (httpResponse.status === 401) 
        throw new NotAuthenticatedError();
    
    if (httpResponse.ok) {
        const events = await httpResponse.json() as EventDetails[];
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

type AddUserRequest = {
    eventId: string,
    email?: string,
    playerName: string
}

type AddUserResponse = {
    user_id: string;
}

export async function addUserToEvent(data: AddUserRequest) : Promise<AddUserResponse> {
    const httpResponse = await fetch(`/api/events/${data.eventId}/players`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: data.email,
            player_name: data.playerName
        })
    });

    await ThrowIfValidationErrors(httpResponse);
    
    if(httpResponse.ok) {
        return await httpResponse.json() as AddUserResponse;
    }

    throw new Error("Http Exception");
}

type UpdateEventUsersRequest = {
    event_id: string,
    email: string,
    player_name: string,
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
            player_name: data.player_name,
            role: data.role
        })
    });

    await ThrowIfValidationErrors(httpResponse);
    
    if(httpResponse.ok) {
        return;
    }

    throw new Error("Http Exception");
}

export async function deleteEventUser(event_id: string, user_id: string) {
    const httpResponse = await fetch(`/api/events/${event_id}/users`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user_id,
        })
    });

    await ThrowIfValidationErrors(httpResponse);
    
    if(httpResponse.ok) {
        return;
    }

    throw new Error("Http Exception");
}

export type DecklistResponse = {
    player_name: string;
    groups: DecklistGroup[],
    deck_warnings: string[],
    decklist_text: string,
}

export type DecklistGroup = {
    group_name: string,
    cards: DecklistCard[],
}

export type DecklistCard = {
    card_name: string,
    quantity: number,
    mana_cost: string,
    mana_value: number,
    type: string,
    warnings: string[],
}

export async function getDecklistRequest(eventId: string, userId: string | null) {
    let url = `/api/events/${eventId}/deck`;
    if (userId) {
        url += `?user_id=${encodeURIComponent(userId)}`;
    }

    const httpResponse = await fetch(url);
    if (httpResponse.status === 401) 
        throw new NotAuthenticatedError();

    if (httpResponse.status === 404) 
        return null;
    
    if (httpResponse.ok) {
        const res = await httpResponse.json() as DecklistResponse;
        return res;
    }

    throw new Error("Http Exception");
}

type SubmitDecklistRequest = {
    event_id: string,
    user_id?: string | null,
    player_name: string,
    decklist_text: string,
}

export async function submitDecklistRequest(data: SubmitDecklistRequest) {
    const httpResponse = await fetch(`/api/events/${data.event_id}/deck`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: data.user_id,
            player_name: data.player_name,
            decklist_text: data.decklist_text,
        })
    });

    await ThrowIfValidationErrors(httpResponse);
    
    if(httpResponse.ok) {
        return;
    }

    throw new Error("Http Exception");
}

export async function deleteDeckRequest(eventId: string) {
    const httpResponse = await fetch(`/api/events/${eventId}/deck`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        }
    });

    await ThrowIfValidationErrors(httpResponse);
    
    if(httpResponse.ok) {
        return;
    }

    throw new Error("Http Exception");
}

type DeleteEventRequest = {
    event_id: string;
}

export async function deleteEvent(data: DeleteEventRequest) {
    const httpResponse = await fetch(`/api/events/${data.event_id}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        }
    });

    await ThrowIfValidationErrors(httpResponse);
    
    if(httpResponse.ok) {
        return;
    }

    throw new Error("Http Exception");
}

type UpdateEventRequest = {
    event_status: "open" | "closed";
}

export async function updateEvent(eventId: string, data: UpdateEventRequest) {
    const httpResponse = await fetch(`/api/events/${eventId}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event_status: data.event_status,
        })
    });

    await ThrowIfValidationErrors(httpResponse);
    
    if(httpResponse.ok) {
        return;
    }

    throw new Error("Http Exception");
}

export async function getEvent(eventId: string) : Promise<EventDetails> {
    const httpResponse = await fetch(`/api/events/${eventId}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (httpResponse.ok)
    {
        const res = await httpResponse.json() as EventDetails;
        return res;
    }

    throw new Error("Http Exception");
}

export async function getFormatsRequest(): Promise<FormatResponse> {
    const httpResponse = await fetch(`/api/events/formats`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (httpResponse.ok) {
        const res = await httpResponse.json() as FormatResponse;
        return res;
    }

    throw new Error("Http Exception");
}

export type FormatResponse = {
    formats: Format[];
}

export type Format = {
    name: string;
    format: string;
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
    format_name: string;
    role: string;
    event_date: string;
    status: string;
    decklist_style: 'commander' | 'sixty';
    player_count: number;
    max_players: number;
    participants: EventParticipant[]
}

type EventParticipant = {
    player_name: string,
    role: string
    user_id: string,
}

export type LoginStartResponse = {
    success: boolean,
    notification: string
}

export type LoginContinueResponse = {
    success: boolean,
    error_type: string,
    email: string
}

export type ValidationErrorResponse = {
    title: string,
    status: number,
    errors: { [index:string] : string[] }
}

async function ThrowIfValidationErrors(response: Response) {
    if (response.status == 400 && response.headers.get("Content-Type") === "application/problem+json") {
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
