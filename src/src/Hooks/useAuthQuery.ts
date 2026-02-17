import { $api } from "../model/api/client";

export function useAuthQuery() {
    const query = $api.useQuery("get", "/api/me", {}, {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
    });

    return {
        ...query,
        authorized: query.data?.authorized ?? false,
        email: query.data?.email,
        userId: query.data?.user_id,
        sessionId: query.data?.session_id,
        name: query.data?.name,
    };
}
