import { $api } from "../model/api/client";

export function useDecklistRevisionsQuery(eventId: string, userId?: string | null, enabled = true) {
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
        },
        {
            retry: false,
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            enabled,
        }
    );
}
