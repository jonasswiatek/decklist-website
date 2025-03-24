import React from 'react';
import { useQuery } from 'react-query';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { DecklistResponse } from '../../model/api/apimodel';
import { DecklistTable } from './DecklistTable';

export function DeckView() {
    const { event_id } = useParams();
    const [ searchParams ] = useSearchParams();

    const id = searchParams.get('id');
    if (!id || !event_id)
        return (<p>not found</p>);

    return (<DeckList event_id={event_id} user_id={id} />)
}

type DeckListProps = {
    event_id: string,
    user_id: string,
}

const DeckList: React.FC<DeckListProps> = (e: DeckListProps) => {
    const { data, error, isLoading } = useQuery({
        queryKey: [`deck-${e.event_id}-${e.user_id}`],
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () =>
            fetch(`/api/events/${e.event_id}/deck?user_id=${encodeURIComponent(e.user_id)}`).then(async (res) => {
                if (res.status === 404) {
                    return null;
                }

                if (!res.ok) {
                    throw "error";
                }

                return await res.json() as DecklistResponse;
            }
        ),
    });

    if (isLoading) {
        return <p>Loading...</p>
    }

    if (error != null) {
        return <p>Error, try later</p>
    }
    
    if (!data) {
        return <p>Deck not found</p>
    }
    const mainboardCount = data?.mainboard.reduce((acc, val) => acc + val.quantity, 0) ?? 0;
    const sideboardCount = data?.sideboard.reduce((acc, val) => acc + val.quantity, 0) ?? 0;

    return (
        <div className="container-fluid">
            <div className='row mb-3'>
                <div className='col-12'>
                    <Link to={`/e/${e.event_id}`} className="btn btn-secondary mb-2">
                        &larr; Back to Event
                    </Link>
                    <h2>{data.player_name}</h2>
                </div>
            </div>
            <div className='row'>
                <div className='col-md-8 col-sm-12 decklist-table-container'>
                    <DecklistTable mainboard={data.mainboard} sideboard={data.sideboard} allowChecklist={true} />
                </div>
            </div>
            <div className={getSubmitButtonClass(mainboardCount!, sideboardCount!)}>
                <div>
                    <span style={{margin: 5}}>Main: {mainboardCount}</span>
                    <span style={{margin: 5}}>Side: {sideboardCount}</span>
                </div>
            </div>
        </div>
    );
}

function getSubmitButtonClass(mainDeckCount: number, sideboardCount: number) {
    if (mainDeckCount < 60 || sideboardCount > 15) {
      return "float-bottom submit-button-wrapper submit-button-warning";
    } else {
      return "float-bottom submit-button-wrapper submit-button-ok";
    }
  }
  