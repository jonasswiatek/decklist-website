import { useQuery } from "react-query";
import { FormatResponse, getFormatsRequest } from "../model/api/apimodel";

export const useFormatsQuery = () => {
    return useQuery<FormatResponse>({
        queryKey: [`formats`],
        staleTime: Infinity, // 1 minute
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () => getFormatsRequest(),
    });
}