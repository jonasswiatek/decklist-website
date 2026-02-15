import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "../model/api/decklist-api-schema";

const fetchClient = createFetchClient<paths>({
    baseUrl: "/",
});

const $api = createClient(fetchClient);

export function useDecklistQuery(eventId: string, userId?: string | null, enabled = true) {
    return $api.useQuery(
        "get",
        "/api/events/{event_id}/deck",
        {
            params: {
                path: {
                    event_id: eventId,
                },
                query: {
                    user_id: userId ?? undefined,
                },
            },
            queryKey: ['decklist', eventId, userId],
            retry: false,
            refetchOnWindowFocus: false,
            enabled,
        }
    );
}

export function useDecklistRevisionQuery(eventId: string, revisionId?: number | null, userId?: string | null, enabled = true) {
    return $api.useQuery(
        "get",
        "/api/events/{event_id}/deck/revisions/{revision_id}",
        {
            params: {
                path: {
                    event_id: eventId,
                    revision_id: revisionId ?? 0,
                },
                query: {
                    user_id: userId ?? undefined,
                },
            },
            queryKey: ['decklist', 'revision', revisionId ?? 'none', eventId, userId ?? ''],
            retry: false,
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            enabled: !!(enabled && revisionId),
        }
    );
}
