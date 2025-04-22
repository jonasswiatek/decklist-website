import { useQuery } from 'react-query';
import { LibraryDecksResponse, getLibraryDecksRequest } from '../model/api/apimodel';

export const useLibraryDecksQuery = (enabled = true) => {
  return useQuery<LibraryDecksResponse>({
    queryKey: [`library-decks`],
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    enabled,
    queryFn: () => getLibraryDecksRequest(),
  });
};
