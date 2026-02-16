import { $api } from "../model/api/client";

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
