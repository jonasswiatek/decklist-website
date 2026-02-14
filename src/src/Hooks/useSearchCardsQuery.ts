import { useDebounce } from 'use-debounce';
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "../model/api/decklist-api-schema";

const fetchClient = createFetchClient<paths>({
    baseUrl: "/",
});

const $api = createClient(fetchClient);

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
