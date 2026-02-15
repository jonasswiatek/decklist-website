import { fetchClient, ValidationError } from "./apimodel";
import type { components } from "./decklist-api-schema";

// --- Re-exported schema types for consumers ---

export type TournamentTimerClock = components["schemas"]["TournamentTimerClock"];
export type UserTournamentsResponseItem = components["schemas"]["UserTournamentsResponseItem"];

// --- Functions ---

export async function createTournament(request: { tournament_name: string }) {
    const { data, error } = await fetchClient.POST("/api/timers", {
        body: {
            tournament_name: request.tournament_name,
        },
    });

    if (error) throw new ValidationError(error);
    if (data) return data;

    throw new Error("Http Exception");
}

export async function deleteTournament(tournamentId: string): Promise<void> {
    const { response } = await fetchClient.DELETE("/api/timers/{tournamentId}", {
        params: {
            path: { tournamentId },
        },
    });

    if (response.ok) return;

    throw new Error("Http Exception");
}

export async function createClock(tournamentId: string, request: { clock_name: string; duration_seconds: number }) {
    const { data, error } = await fetchClient.POST("/api/timers/{tournamentId}/clocks", {
        params: {
            path: { tournamentId },
        },
        body: {
            clock_name: request.clock_name,
            duration_seconds: request.duration_seconds,
        },
    });

    if (error) throw new ValidationError(error);
    if (data) return data;

    throw new Error("Http Exception");
}

export async function deleteClock(tournamentId: string, clockId: string): Promise<void> {
    const { response } = await fetchClient.DELETE("/api/timers/{tournamentId}/clocks/{clockId}", {
        params: {
            path: { tournamentId, clockId },
        },
    });

    if (response.ok) return;

    throw new Error("Http Exception");
}

export async function updateClock(tournamentId: string, clockId: string, request: { is_running: boolean }) {
    const { data, error } = await fetchClient.POST("/api/timers/{tournamentId}/clocks/{clockId}", {
        params: {
            path: { tournamentId, clockId },
        },
        body: {
            is_running: request.is_running,
        },
    });

    if (error) throw new ValidationError(error);
    if (data) return data;

    throw new Error("Http Exception");
}

export async function resetClock(tournamentId: string, clockId: string) {
    const { data } = await fetchClient.POST("/api/timers/{tournamentId}/clocks/{clockId}/reset", {
        params: {
            path: { tournamentId, clockId },
        },
    });

    if (data) return data;

    throw new Error("Http Exception");
}

export async function adjustClock(tournamentId: string, clockId: string, request: { ms_adjustment: number }) {
    const { data } = await fetchClient.POST("/api/timers/{tournamentId}/clocks/{clockId}/adjust", {
        params: {
            path: { tournamentId, clockId },
        },
        body: {
            ms_adjustment: request.ms_adjustment,
        },
    });

    if (data) return data;

    throw new Error("Http Exception");
}

export async function addManager(tournamentId: string, request: { user_email: string; user_name: string }): Promise<void> {
    const { response, error } = await fetchClient.POST("/api/timers/{tournamentId}/managers", {
        params: {
            path: { tournamentId },
        },
        body: {
            user_email: request.user_email,
            user_name: request.user_name,
        },
    });

    if (error) throw new ValidationError(error);
    if (response.ok) return;

    throw new Error("Http Exception");
}

export async function deleteManager(tournamentId: string, userId: string): Promise<void> {
    const { response } = await fetchClient.DELETE("/api/timers/{tournamentId}/managers/{userId}", {
        params: {
            path: { tournamentId, userId },
        },
    });

    if (response.ok) return;

    throw new Error("Http Exception");
}

export async function forceUpdate(tournamentId: string): Promise<void> {
    const { response } = await fetchClient.POST("/api/timers/{tournamentId}/force-update", {
        params: {
            path: { tournamentId },
        },
    });

    if (response.ok) return;

    throw new Error("Http Exception");
}
