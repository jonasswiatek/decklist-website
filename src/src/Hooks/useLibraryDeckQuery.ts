import { $api } from "../model/api/client";

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
        },
        {
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
            enabled: !!deck_id && enabled,
        }
    );
};
