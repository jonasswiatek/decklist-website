import { $api } from "../model/api/client";

export const userTournamentsQueryKey = $api.queryOptions("get", "/api/timers").queryKey;

export function useUserTournaments(enabled: boolean = true) {
    return $api.useQuery(
        "get",
        "/api/timers",
        {},
        {
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
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
            enabled: enabled,
        }
    );
}
