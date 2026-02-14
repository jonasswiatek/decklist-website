import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "../model/api/decklist-api-schema";

const fetchClient = createFetchClient<paths>({
    baseUrl: "/",
});

const $api = createClient(fetchClient);

export const useLibraryDecksQuery = (enabled = true) => {
    return $api.useQuery(
        "get",
        "/api/decks/library",
        {
            queryKey: [`library-decks`],
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
            enabled,
        }
    );
};
