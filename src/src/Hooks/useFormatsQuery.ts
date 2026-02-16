import { $api } from "../model/api/client";

export const useFormatsQuery = () => {
    return $api.useQuery(
        "get",
        "/api/events/formats",
        {
            queryKey: [`formats`],
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
        }
    );
}