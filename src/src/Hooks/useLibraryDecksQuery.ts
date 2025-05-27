import { LibraryDecksResponse, getLibraryDecksRequest } from '../model/api/apimodel';
import { useQuery } from '@tanstack/react-query'

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
