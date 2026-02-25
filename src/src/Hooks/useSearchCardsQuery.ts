import { useDebounce } from 'use-debounce';
import { $api } from "../model/api/client";

export function useSearchCardsQuery(searchQuery?: string, options?: { debounceMs?: number; minLength?: number }) {
    const debounceMs = options?.debounceMs ?? 1000;
    const minLength = options?.minLength ?? 4;
    const [value] = useDebounce(searchQuery, debounceMs);

    return $api.useQuery(
        "get",
        "/api/cards/search",
        {
            params: {
                query: {
                    q: value ?? '',
                },
            },
        },
        {
            enabled: !!value && value.length >= minLength,
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            retry: false,
        }
    );
}
