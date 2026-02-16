import { useDebounce } from 'use-debounce';
import { $api } from "../model/api/client";

export function useSearchCardsQuery(searchQuery?: string) {
    const [value] = useDebounce(searchQuery, 1000);

    return $api.useQuery(
        "get",
        "/api/cards/search",
        {
            params: {
                query: {
                    q: value ?? '',
                },
            },
            queryKey: ['search-cards', value],
            enabled: !!value && value.length > 3,
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            retry: false,
        }
    );
}
