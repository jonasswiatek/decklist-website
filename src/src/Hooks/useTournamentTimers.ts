import { useQuery, UseQueryResult } from 'react-query';
import {
    getUserTournaments,
    UserTournamentsResponse,
    getTournamentDetails,
    TournamentDetailsResponse,
} from '../model/api/tournamentTimers';

const TOURNAMENT_TIMERS_QUERY_KEY = 'tournamentTimers';

export function useUserTournaments(enabled: boolean = true): UseQueryResult<UserTournamentsResponse, Error> {
    return useQuery<UserTournamentsResponse, Error>(
        [TOURNAMENT_TIMERS_QUERY_KEY, 'userTournaments'],
        () => getUserTournaments(),
        {
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
            enabled: enabled,
        }
    );
}

export function useTournamentDetails(tournamentId: string, enabled : boolean = true): UseQueryResult<TournamentDetailsResponse, Error> {
    return useQuery<TournamentDetailsResponse, Error>(
        [TOURNAMENT_TIMERS_QUERY_KEY, 'tournamentDetails', tournamentId],
        () => getTournamentDetails(tournamentId),
        {
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
            enabled: enabled,
        }
    );
}
