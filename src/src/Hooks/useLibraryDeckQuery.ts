import { useQuery } from 'react-query';
import { getLibraryDeckRequest, LibraryDeckResponse } from '../model/api/apimodel';

export const useLibraryDeckQuery = (deck_id?: string, enabled = true) => {
  return useQuery<LibraryDeckResponse>({
    queryKey: ['library-deck', deck_id],
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!deck_id && enabled,
    queryFn: () => getLibraryDeckRequest({ deck_id: deck_id! }),
  });
};
