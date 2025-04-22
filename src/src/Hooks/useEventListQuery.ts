import { useQuery } from 'react-query';
import { EventListItem, getAllEventsRequest } from '../model/api/apimodel';

export function useEventListQuery(enabled: boolean = true) {
  return useQuery<EventListItem[]>({
    queryKey: ['my-events'],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: enabled,
    queryFn: () => getAllEventsRequest()
  });
}
