import createFetchClient from "openapi-fetch";
import type { paths, components } from "./decklist-api-schema";

const fetchClient = createFetchClient<paths>({
    baseUrl: "/",
});

export { fetchClient };

// --- Re-exported schema types for consumers ---

export type EventDetails = components["schemas"]["EventDetails"];
export type DecklistResponse = components["schemas"]["DecklistResponse"];
export type DecklistGroup = components["schemas"]["CardGroup"];
export type DecklistCard = components["schemas"]["DecklistCard"];
export type Format = components["schemas"]["FormatListItem"];
export type LibraryDeckResponse = components["schemas"]["LibraryDecklistResponse"];
export type LoginContinueResponse = components["schemas"]["LoginContinueResponse"];
export type MeResponse = components["schemas"]["MeResponse"];

// --- Error handling ---

export type ValidationErrorResponse = components["schemas"]["HttpValidationProblemDetails"];

export class ValidationError extends Error {
    public ValidationError: ValidationErrorResponse;

    constructor(errors: ValidationErrorResponse) {
        super(errors.title ?? "Validation Error");
        this.ValidationError = errors;
    }
}

export class NotAuthenticatedError extends Error {

}

export class NotFoundError extends Error {

}

// --- Auth ---

export async function meRequest() : Promise<MeResponse> {
    const { data, response } = await fetchClient.GET("/api/me");
    if (response.status === 401)
        return { authorized: false } as MeResponse;

    if (data) return data;

    throw new Error("Http Exception");
}

export async function startLoginRequest(data: { email: string }) {
    const { data: responseData, error } = await fetchClient.POST("/api/login/start", {
        body: {
            email: data.email.trim(),
        },
    });

    if (error) throw new ValidationError(error);
    if (responseData) return responseData;

    throw new Error("Http Exception");
}

export async function continueLoginRequest(data: { email: string; code: string }) {
    const { data: responseData, error } = await fetchClient.POST("/api/login/continue", {
        body: {
            email: data.email.trim(),
            code: data.code.trim(),
        },
    });

    if (error) throw new ValidationError(error);
    if (responseData) return responseData;

    throw new Error("Http Exception");
}

export async function googleLoginRequest(data: { token: string }) {
    const { data: responseData } = await fetchClient.POST("/api/login/google", {
        body: {
            token: data.token,
        },
    });

    if (responseData) return responseData;

    throw new Error("Http Exception");
}

export async function logoutRequest() {
    const { response } = await fetchClient.POST("/api/logout");

    if (response.ok) return;

    throw new Error("Http Exception");
}

// --- Events ---

export async function getMultipleEventsRequest(eventIds: string[]) {
    const { data, response } = await fetchClient.GET("/api/events/batch", {
        params: {
            query: {
                eventId: eventIds,
            },
        },
    });

    if (response.status === 401)
        throw new NotAuthenticatedError();

    if (data) return data;

    throw new Error("Http Exception");
}

export async function createEventRequest(data: { event_name: string; format: string; event_date: Date }) {
    const { data: responseData, error } = await fetchClient.POST("/api/events", {
        body: {
            event_name: data.event_name.trim(),
            format: data.format,
            event_date: data.event_date.toISOString().split('T')[0],
        },
    });

    if (error) throw new ValidationError(error);
    if (responseData) return responseData;

    throw new Error("Http Exception");
}

export async function addUserToEvent(data: { eventId: string; email?: string; playerName: string }) {
    const { data: responseData, error } = await fetchClient.POST("/api/events/{eventId}/players", {
        params: {
            path: {
                eventId: data.eventId,
            },
        },
        body: {
            email: data.email?.trim(),
            player_name: data.playerName.trim(),
        },
    });

    if (error) throw new ValidationError(error);
    if (responseData) return responseData;

    throw new Error("Http Exception");
}

export async function updateEventUsers(data: { event_id: string; email: string; player_name: string; role: "judge" | "none" }) {
    const { response, error } = await fetchClient.POST("/api/events/{eventId}/users", {
        params: {
            path: {
                eventId: data.event_id,
            },
        },
        body: {
            email: data.email.trim(),
            player_name: data.player_name.trim(),
            role: data.role === "judge" ? "judge" : null,
        },
    });

    if (error) throw new ValidationError(error);
    if (response.ok) return;

    throw new Error("Http Exception");
}

export async function deleteEventUser(event_id: string, user_id: string) {
    const { response, error } = await fetchClient.DELETE("/api/events/{eventId}/users", {
        params: {
            path: {
                eventId: event_id,
            },
        },
        body: {
            user_id: user_id,
        },
    });

    if (error) throw new ValidationError(error);
    if (response.ok) return;

    throw new Error("Http Exception");
}

export async function updateEvent(eventId: string, data: { event_status: "open" | "closed" }) {
    const { response } = await fetchClient.POST("/api/events/{eventId}", {
        params: {
            path: {
                eventId: eventId,
            },
        },
        body: {
            event_status: data.event_status,
        },
    });

    if (response.ok) return;

    throw new Error("Http Exception");
}

export async function deleteEvent(data: { event_id: string }) {
    const { response } = await fetchClient.DELETE("/api/events/{eventId}", {
        params: {
            path: {
                eventId: data.event_id,
            },
        },
    });

    if (response.ok) return;

    throw new Error("Http Exception");
}

export async function getEvent(eventId: string) {
    const { data } = await fetchClient.GET("/api/events/{eventId}", {
        params: {
            path: {
                eventId: eventId,
            },
        },
    });

    if (data) return data;

    throw new Error("Http Exception");
}

// --- Decklists ---

export async function getDecklistRequest(eventId: string, userId: string | null) {
    const { data, response } = await fetchClient.GET("/api/events/{event_id}/deck", {
        params: {
            path: {
                event_id: eventId,
            },
            query: {
                user_id: userId ?? undefined,
            },
        },
    });

    if (response.status === 401)
        throw new NotAuthenticatedError();

    if (response.status === 404)
        return null;

    if (data) return data;

    throw new Error("Http Exception");
}

export async function submitDecklistRequest(data: { event_id: string; user_id?: string | null; player_name: string; deck_name?: string; decklist_text: string }) {
    const { response, error } = await fetchClient.POST("/api/events/{event_id}/deck", {
        params: {
            path: {
                event_id: data.event_id,
            },
        },
        body: {
            user_id: data.user_id,
            player_name: data.player_name.trim(),
            deck_name: data.deck_name?.trim(),
            decklist_text: data.decklist_text,
        },
    });

    if (error) throw new ValidationError(error);
    if (response.ok) return;

    throw new Error("Http Exception");
}

export async function deleteDeckRequest(eventId: string) {
    const { response, error } = await fetchClient.DELETE("/api/events/{event_id}/deck", {
        params: {
            path: {
                event_id: eventId,
            },
        },
    });

    if (error) throw new ValidationError(error);
    if (response.ok) return;

    throw new Error("Http Exception");
}

export async function setDeckChecked(data: { event_id: string; user_id: string; is_checked: boolean }) {
    const { response } = await fetchClient.POST("/api/events/{event_id}/deck/set-checked", {
        params: {
            path: {
                event_id: data.event_id,
            },
        },
        body: {
            user_id: data.user_id,
            is_checked: data.is_checked,
        },
    });

    if (response.ok) return;

    throw new Error("Http Exception");
}

// --- Library decks ---

export async function getLibraryDeckRequest(data: { deck_id: string }) {
    const { data: responseData, response } = await fetchClient.GET("/api/decks/library/{deckId}", {
        params: {
            path: {
                deckId: data.deck_id,
            },
        },
    });

    if (response.status === 404)
        throw new NotFoundError();

    if (responseData) return responseData;

    throw new Error("Http Exception");
}

export async function saveLibraryDeckRequest(data: { deck_id?: string; deck_name: string; format: string; decklist_text: string }) {
    const { data: responseData, error } = data.deck_id
        ? await fetchClient.POST("/api/decks/library/{deckId}", {
            params: {
                path: {
                    deckId: data.deck_id,
                },
            },
            body: {
                deck_id: data.deck_id,
                deck_name: data.deck_name.trim(),
                format: data.format,
                decklist_text: data.decklist_text,
            },
        })
        : await fetchClient.POST("/api/decks/library", {
            body: {
                deck_id: data.deck_id,
                deck_name: data.deck_name.trim(),
                format: data.format,
                decklist_text: data.decklist_text,
            },
        });

    if (error) throw new ValidationError(error);
    if (responseData) return responseData;

    throw new Error("Http Exception");
}

export async function deleteLibraryDeckRequest(deck_id: string): Promise<void> {
    const { response } = await fetchClient.DELETE("/api/decks/library/{deckId}", {
        params: {
            path: {
                deckId: deck_id,
            },
        },
    });

    if (response.ok) return;

    throw new Error("Http Exception");
}
