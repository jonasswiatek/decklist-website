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

export interface TournamentDetailsResponse {
    tournament_id: string;
    tournament_name: string;
    role: string | null;
    managers: TournamentManager[];
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
