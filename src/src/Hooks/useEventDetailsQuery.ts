import { useQuery } from "react-query";
import { EventDetails, getEvent } from "../model/api/apimodel";

export function useEventDetailsQuery(event_id: string, enabled: boolean = true) {
    return useQuery<EventDetails>({
        queryKey: ['event', event_id],
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
        enabled: enabled,
        queryFn: () => getEvent(event_id),
    });
}