import { ThrowIfValidationErrors } from "./apimodel";

export interface CreateTournamentRequest {
    tournament_name: string;
}

export interface CreateTournamentResponse {
    tournament_id: string;
    tournament_name: string;
}

export interface UserTournamentsResponseItem {
    tournament_id: string;
    tournament_name: string;
    role: string;
}

export interface UserTournamentsResponse {
    tournaments: UserTournamentsResponseItem[];
}

export interface TournamentManager {
    user_id: string;
    user_name: string;
    role: string;
}

export interface TournamentTimerClock {
    clock_id: string;
    clock_name: string;
    is_running: boolean;
    duration_seconds: number;
    ms_remaining: number;
}

export interface TournamentDetailsResponse {
    tournament_id: string;
    tournament_name: string;
    role: string | null;
    managers: TournamentManager[];
    clocks: TournamentTimerClock[];
}

export interface CreateClockRequest {
    clock_name: string;
    duration_seconds: number;
}

export interface UpdateClockRequest {
    is_running: boolean;
}

export interface AdjustClockRequest {
    ms_adjustment: number;
}

export interface AddManagerRequest {
    user_email: string;
    user_name: string;
}

const API_BASE_URL = '/api/timers';

export async function createTournament(request: CreateTournamentRequest): Promise<CreateTournamentResponse> {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    await ThrowIfValidationErrors(response);

    if (!response.ok) {
        throw new Error(`Error creating tournament: ${response.statusText}`);
    }
    return response.json();
}

export async function getUserTournaments(): Promise<UserTournamentsResponse> {
    const response = await fetch(API_BASE_URL, {
        method: 'GET',
    });
    if (!response.ok) {
        throw new Error(`Error fetching user tournaments: ${response.statusText}`);
    }
    return response.json();
}

export async function getTournamentDetails(tournamentId: string): Promise<TournamentDetailsResponse> {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}`, {
        method: 'GET',
    });
    if (!response.ok) {
        throw new Error(`Error fetching tournament details: ${response.statusText}`);
    }
    return response.json();
}

export async function deleteTournament(tournamentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`Error deleting tournament: ${response.statusText}`);
    }
}

export async function createClock(tournamentId: string, request: CreateClockRequest): Promise<TournamentTimerClock> {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}/clocks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    await ThrowIfValidationErrors(response);

    if (!response.ok) {
        throw new Error(`Error creating clock: ${response.statusText}`);
    }
    return response.json();
}

export async function deleteClock(tournamentId: string, clockId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}/clocks/${clockId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`Error deleting clock: ${response.statusText}`);
    }
}

export async function updateClock(tournamentId: string, clockId: string, request: UpdateClockRequest): Promise<TournamentTimerClock> {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}/clocks/${clockId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    await ThrowIfValidationErrors(response);

    if (!response.ok) {
        throw new Error(`Error updating clock: ${response.statusText}`);
    }

    return response.json();
}

export async function resetClock(tournamentId: string, clockId: string): Promise<TournamentTimerClock> {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}/clocks/${clockId}/reset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error resetting clock: ${response.statusText}`);
    }

    return response.json();
}

export async function adjustClock(tournamentId: string, clockId: string, request: AdjustClockRequest): Promise<TournamentTimerClock> {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}/clocks/${clockId}/adjust`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    await ThrowIfValidationErrors(response);

    if (!response.ok) {
        throw new Error(`Error adjusting clock: ${response.statusText}`);
    }

    return response.json();
}

export async function addManager(tournamentId: string, request: AddManagerRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}/managers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    await ThrowIfValidationErrors(response);

    if (!response.ok) {
        throw new Error(`Error adding manager: ${response.statusText}`);
    }
}

export async function deleteManager(tournamentId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${tournamentId}/managers/${userId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`Error deleting manager: ${response.statusText}`);
    }
}
