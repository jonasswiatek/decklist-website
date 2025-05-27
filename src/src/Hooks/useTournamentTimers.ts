import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
    getUserTournaments,
    UserTournamentsResponse,
    getTournamentDetails,
    TournamentDetailsResponse,
} from '../model/api/tournamentTimers';

const TOURNAMENT_TIMERS_QUERY_KEY = 'tournamentTimers';

export function useUserTournaments(enabled: boolean = true): UseQueryResult<UserTournamentsResponse, Error> {
    return useQuery<UserTournamentsResponse, Error>({
        queryKey: [TOURNAMENT_TIMERS_QUERY_KEY, 'userTournaments'],
        queryFn: () => getUserTournaments(),
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
        enabled: enabled,
    });
}

export function useTournamentDetails(tournamentId: string, enabled : boolean = true): UseQueryResult<TournamentDetailsResponse, Error> {
    return useQuery<TournamentDetailsResponse, Error>({
        queryKey: [TOURNAMENT_TIMERS_QUERY_KEY, 'tournamentDetails', tournamentId],
        queryFn: () => getTournamentDetails(tournamentId),
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
        enabled: enabled,
    });
}
