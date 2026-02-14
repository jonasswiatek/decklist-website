import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "../model/api/decklist-api-schema";

const fetchClient = createFetchClient<paths>({
    baseUrl: "/",
});

const $api = createClient(fetchClient);

const TOURNAMENT_TIMERS_QUERY_KEY = 'tournamentTimers';

export function useUserTournaments(enabled: boolean = true) {
    return $api.useQuery(
        "get",
        "/api/timers",
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
            queryKey: [TOURNAMENT_TIMERS_QUERY_KEY, 'tournamentDetails', tournamentId],
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
            enabled: enabled,
        }
    );
}
