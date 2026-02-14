import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "../model/api/decklist-api-schema";

const fetchClient = createFetchClient<paths>({
    baseUrl: "/",
});

const $api = createClient(fetchClient);

export const useLibraryDeckQuery = (deck_id?: string, enabled = true) => {
    return $api.useQuery(
        "get",
        "/api/decks/library/{deckId}",
        {
            params: {
                path: {
                    deckId: deck_id!,
                },
            },
            queryKey: ['library-deck', deck_id],
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
            enabled: !!deck_id && enabled,
        }
    );
};
