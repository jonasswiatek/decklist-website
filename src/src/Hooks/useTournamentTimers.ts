import { $api } from "../model/api/client";

const TOURNAMENT_TIMERS_QUERY_KEY = 'tournamentTimers';
export const userTournamentsQueryKey = [TOURNAMENT_TIMERS_QUERY_KEY, 'userTournaments'] as const;

export function useUserTournaments(enabled: boolean = true) {
    return $api.useQuery(
        "get",
        "/api/timers",
        {},
        {
            queryKey: [TOURNAMENT_TIMERS_QUERY_KEY, 'userTournaments'],
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
            enabled: enabled,
        }
    );
}

export function useTournamentDetails(tournamentId: string, enabled: boolean = true) {
    return $api.useQuery(
        "get",
        "/api/timers/{tournamentId}",
        {
            params: {
                path: {
                    tournamentId: tournamentId,
                },
            },
        },
        {
            queryKey: [TOURNAMENT_TIMERS_QUERY_KEY, 'tournamentDetails', tournamentId],
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
            enabled: enabled,
        }
    );
}
