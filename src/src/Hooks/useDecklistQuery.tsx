import { useQuery } from 'react-query';
import { DecklistResponse, getDecklistRequest } from '../model/api/apimodel';

export function useDecklistQuery(eventId: string, userId: string | null, enabled = true) {
    return useQuery<DecklistResponse | null>({
        queryKey: ['decklist', eventId, userId],
        retry: false,
        refetchOnWindowFocus: false,
        enabled,
        queryFn: () => getDecklistRequest(eventId, userId),
    });
}
