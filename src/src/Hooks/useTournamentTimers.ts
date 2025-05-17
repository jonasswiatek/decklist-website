import { useQuery, UseQueryResult } from 'react-query';
import {
    getUserTournaments,
    UserTournamentsResponse,
} from '../model/api/tournamentTimers';

const TOURNAMENT_TIMERS_QUERY_KEY = 'tournamentTimers';

export function useUserTournaments(): UseQueryResult<UserTournamentsResponse, Error> {
    return useQuery<UserTournamentsResponse, Error>(
        [TOURNAMENT_TIMERS_QUERY_KEY, 'userTournaments'],
        getUserTournaments
    );
}
