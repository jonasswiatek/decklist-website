import { fetchClient } from "./client";
import type { components } from "./decklist-api-schema";

// --- Re-exported schema types for consumers ---

export type EventDetails = components["schemas"]["EventDetails"];
export type DecklistResponse = components["schemas"]["DecklistResponse"];
export type DecklistGroup = components["schemas"]["CardGroup"];
export type DecklistCard = components["schemas"]["DecklistCard"];
export type Format = components["schemas"]["FormatListItem"];
export type LibraryDeckResponse = components["schemas"]["LibraryDecklistResponse"];
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

export async function getDecklistRequest(eventId: string, userId?: string | null) {
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

