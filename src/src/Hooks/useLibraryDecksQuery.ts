import { $api } from "../model/api/client";

export const libraryDecksQueryKey = $api.queryOptions("get", "/api/decks/library").queryKey;

export const useLibraryDecksQuery = (enabled = true) => {
    return $api.useQuery(
        "get",
        "/api/decks/library",
        {},
        {
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
            enabled,
        }
    );
};
