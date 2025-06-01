import { useQuery } from '@tanstack/react-query'
import { FormatResponse, getFormatsRequest } from "../model/api/apimodel";

export const useFormatsQuery = () => {
    return useQuery<FormatResponse>({
        queryKey: [`formats`],
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () => getFormatsRequest(),
    });
}