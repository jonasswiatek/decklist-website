import { $api } from "../model/api/client";

export function useEventDetailsQuery(event_id: string, enabled: boolean = true) {
    return $api.useQuery(
        "get",
        "/api/events/{eventId}",
        {
            params: {
                path: {
                    eventId: event_id,
                },
            },
        },
        {
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
            enabled,
        }
    );
}
