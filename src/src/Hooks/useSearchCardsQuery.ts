import { useQuery } from '@tanstack/react-query';
import { CardResult, searchCardsRequest } from '../model/api/apimodel';
import { useDebounce } from 'use-debounce';

export function useSearchCardsQuery(searchQuery?: string) {
  const [value] = useDebounce(searchQuery, 1000);

  return useQuery<CardResult[]>({
    queryKey: ['search-cards', value],
    queryFn: () => searchCardsRequest(value),
    enabled: !!value && value.length > 3,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
