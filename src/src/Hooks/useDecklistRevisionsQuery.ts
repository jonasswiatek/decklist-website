import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "../model/api/decklist-api-schema";

const fetchClient = createFetchClient<paths>({
    baseUrl: "/",
});

const $api = createClient(fetchClient);

export function useDecklistRevisionsQuery(eventId: string, userId: string | null, enabled = true) {
    return $api.useQuery(
        "get",
        "/api/events/{event_id}/deck/revisions",
        {
            params: {
                path: {
                    event_id: eventId,
                },
                query: {
                    user_id: userId ?? undefined,
                },
            },
            queryKey: ['decklist', 'revisions', eventId, userId],
            retry: false,
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            enabled,
        }
    );
}
