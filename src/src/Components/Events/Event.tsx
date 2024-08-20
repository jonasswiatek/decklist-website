
import { useParams } from 'react-router-dom';
import { EventDetails, joinEventRequest } from '../../model/api/apimodel';
import { useQuery } from 'react-query';

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
                        <p>No such event.</p>
                    </div>
                </div>
            </>
        )
    }


    if (!data.joined) {
        return <UnjoinedView event={data} refetch={refetch} />
    }

    if (data.role === "owner" || data.role === "judge") {
        //Being viewed by the owner or a judge.
        return <JudgeView event={data} />
    }
    
    //Joined player - show the decklist editor.
    return (
      <>
        <div className='row'>
            <div className='col'>
                <p>{data.event_name}</p>
                <p>Decklist view</p>
            </div>
        </div>
      </>
    )
}

type EventViewProps = {
    event: EventDetails,
    refetch?: () => void
}

const JudgeView: React.FC<EventViewProps> = (e) => {
    return (
        <>
          <div className='row'>
              <div className='col'>
                  <p>{e.event.event_name}</p>
                  <p>Invite Link: https://decklist.lol/events/{e.event.event_id}</p>
              </div>
          </div>
          <div className='row'>
              <div className='col'>
                  <h2>Administrators</h2>
                  <table>
                    <tr>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                    {e.event.participants?.filter(a => a.role == "owner" || a.role == "judge").map((p) => {
                        return (
                            <>
                                <tr>
                                    <td>{p.email}</td>
                                    <td>{p.role}</td>
                                </tr>
                            </>
                        )
                    })}
                  </table>
              </div>
          </div>
          <div className='row'>
              <div className='col'>
                  <h2>Players</h2>
                  <table>
                    <tr>
                        <th>Email</th>
                        <th>Deck submitted</th>
                    </tr>
                    {e.event.participants?.filter(a => a.role == "player").map((p) => {
                        return (
                            <>
                                <tr>
                                    <td>{p.email}</td>
                                    <td>No</td>
                                </tr>
                            </>
                        )
                    })}
                  </table>
              </div>
          </div>
        </>
    )
}

const UnjoinedView: React.FC<EventViewProps> = (e) => {
    const joinEvent = async () => {
        await joinEventRequest({event_id: e.event.event_id});
        e.refetch!();
    };

    return (
        <>
          <div className='row'>
              <div className='col'>
                  <p>{e.event.event_name}</p>
                  <p>Invite Link: https://decklist.lol/events/{e.event.event_id}</p>
              </div>
          </div>
          <div className='row'>
              <div className='col'>
                <button type="button" className="btn btn-primary" onClick={joinEvent}>Join event</button>
              </div>
          </div>
        </>
    )
}