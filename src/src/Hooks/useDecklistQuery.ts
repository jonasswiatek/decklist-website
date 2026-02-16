import { $api } from "../model/api/client";

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
        },
        {
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
        },
        {
            retry: false,
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            enabled: !!(enabled && revisionId),
        }
    );
}
