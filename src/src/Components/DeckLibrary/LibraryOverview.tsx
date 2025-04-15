import { useQuery } from "react-query";
import { getLibraryDecksRequest, LibraryDecksResponse } from "../../model/api/apimodel";
import { LoadingScreen } from "../Login/LoadingScreen";
import { PlusCircle, ExclamationTriangle } from 'react-bootstrap-icons';

export const LibraryOverview: React.FC = () => {
  const { data, error, isLoading } = useQuery<LibraryDecksResponse>({
      queryKey: [`library-deckS`],
      retry: false,
      refetchOnWindowFocus: false,
      queryFn: () => getLibraryDecksRequest(),
  });

  if (isLoading) {
      return <LoadingScreen />
  }
  
  if(error) {
      return (
          <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error loading deck</h4>
              <hr />
              <p className="mb-0">Please try again later.</p> 
          </div>
      );
  }

  return (
    <>
      <div className="mb-4">
        <h2>Your saved decks</h2>
        <p className="text-muted">You can quickly reuse these decklists when signing up for events</p>
      </div>
      <div className="mb-4">
        {data && data.decks.length >= 20 ? (
          <div className="alert alert-warning">
            You can only have a maximum of 20 saved decks. Please delete some decks before creating new ones.
          </div>
        ) : (
          <a href="/library/deck" className="btn btn-primary">
            <PlusCircle className="me-2" /> Create New Deck
          </a>
        )}
      </div>
      {!data || data.decks.length === 0 ? (
        <div className="text-center mt-5">
          <h3>No decks found in your library</h3>
          <p>Create a deck to get started.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th scope="col">Deck Name</th>
                <th scope="col"></th>
                <th scope="col">Format</th>
              </tr>
            </thead>
            <tbody>
              {data.decks.map((deck) => (
                <tr key={deck.deck_name}>
                  <td>
                    <a href={`/library/deck/${deck.deck_id}`} className="text-decoration-none text-light">
                      {deck.deck_name}
                    </a>
                  </td>
                <td className="text-end">
                    <div>
                        {deck.has_warnings && <ExclamationTriangle className="text-warning" />}
                    </div>
                </td>

                  <td>{deck.format_name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-muted fst-italic">Decks that haven't been used for 90 days are automatically deleted</p>
    </>
  );
}