import { useQuery } from 'react-query';
import { DecklistRevisionsResponse, getDecklistRevisionsRequest } from '../model/api/apimodel';

export function useDecklistRevisionsQuery(eventId: string, userId: string | null, enabled = true) {
    return useQuery<DecklistRevisionsResponse | null>({
        queryKey: ['decklist', 'revisions', eventId, userId],
        retry: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        enabled,
        queryFn: () => getDecklistRevisionsRequest(eventId, userId),
    });
}

