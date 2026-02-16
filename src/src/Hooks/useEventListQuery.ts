import { $api } from "../model/api/client";

export const useEventListQuery = (enabled: boolean = true) => {
    return $api.useQuery(
        "get",
        "/api/events",
        {},
        {
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            retry: false,
            enabled,
        }
    );
}