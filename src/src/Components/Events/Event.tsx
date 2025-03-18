import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { EventDetails } from '../../model/api/apimodel';
import { JoinedPlayerView } from './Views/JoinedPlayerView';
import { JudgeView } from './Views/JudgeView';
import { UnjoinedView } from './Views/UnjoinedView';

export function EventView() {
    const { event_id } = useParams();

    const { data, error, isLoading, refetch } = useQuery({
        queryKey: [`event-${event_id}`],
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () =>
            fetch(`/api/events/${event_id}`).then(async (res) => {
                if (res.status === 404) {
                    return null;
                }

                if (!res.ok) {
                    throw "error";
                }

                return await res.json() as EventDetails;
            }
        ),
    });
    
    if (isLoading) {
        return (
            <>
                <div className='row'>
                    <div className='col'>
                        <p>Loading...</p>
                    </div>
                </div>
            </>
        )
    }

    if(error === "error") {
        return (
            <>
                <div className='row'>
                    <div className='col'>
                        <p>Error. Try again later.</p>
                    </div>
                </div>
            </>
        )
    }

    if(!data) {
        return (
            <>
                <div className='row'>
                    <div className='col'>
                        <p>Can't find this event. Check that the code you entered is correct.</p>
                    </div>
                </div>
            </>
        )
    }

    if (!data.joined) {
        return <UnjoinedView event={data} refetch={refetch} />
    }

    if (data.role === "owner" || data.role === "judge") {
        //Being viewed by a judge.
        return (
            <>
                <div className='row'>
                    <div className='col'>
                        <h1>{data.event_name}</h1>
                        <br></br>
                    </div>
                </div>
                <JudgeView event={data} refetch={refetch} />
            </>
        )
    }
    
    //Joined player - show the decklist editor.
    return (
      <>
        <div className='row'>
            <div className='col'>
                <h1>{data.event_name}</h1>
                <br></br>
            </div>
        </div>
        <JoinedPlayerView event={data} />
      </>
    )
}
