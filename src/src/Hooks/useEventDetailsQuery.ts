import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "../model/api/decklist-api-schema";

const fetchClient = createFetchClient<paths>({
    baseUrl: "/",
});

const $api = createClient(fetchClient);

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
            queryKey: ['event', event_id],
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
            enabled: enabled,
        }
    );
}
