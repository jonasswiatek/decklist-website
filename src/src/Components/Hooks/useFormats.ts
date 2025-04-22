import { useQuery } from "react-query";
import { FormatResponse, getFormatsRequest } from "../../model/api/apimodel";

export const useFormats = () => {
    const { data, isLoading, error } = useQuery<FormatResponse>({
        queryKey: [`formats`],
        staleTime: Infinity, // 1 minute
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () => getFormatsRequest(),
    });
    
    return { data, isLoading, error };
}