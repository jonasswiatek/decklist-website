import { useQuery } from "react-query";
import { EventDetails, getEvent } from "../../model/api/apimodel";

export function useEventDetails(event_id: string, enabled: boolean = true) {
    const { data, error, isLoading, refetch } = useQuery<EventDetails>({
        queryKey: [`event-${event_id}`],
        staleTime: 1000 * 30, // 39 seconds
        retry: false,
        refetchOnWindowFocus: false,
        enabled: enabled,
        queryFn: () => getEvent(event_id),
    });
    
    return { data, error, isLoading, refetch };
}