import { useQuery } from 'react-query';
import { DecklistResponse, getDecklistRequest, getDecklistRevisionRequest } from '../model/api/apimodel';

export function useDecklistQuery(eventId: string, userId: string | null, enabled = true) {
    return useQuery<DecklistResponse | null>({
        queryKey: ['decklist', eventId, userId],
        retry: false,
        refetchOnWindowFocus: false,
        enabled,
        queryFn: () => getDecklistRequest(eventId, userId),
    });
}

export function useDecklistRevisionQuery(eventId: string, revisionId?: number | null, userId?: string | null, enabled = true) {
    return useQuery<DecklistResponse | null>({
        queryKey: ['decklist', 'revision', revisionId ?? 0, eventId, userId ?? ''],
        retry: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        enabled: !!(enabled && revisionId),
        queryFn: () => getDecklistRevisionRequest(eventId, revisionId, userId),
    });
}
