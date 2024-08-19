
import { useParams } from 'react-router-dom';
import { EventDetails } from '../../model/api/apimodel';
import { useQuery } from 'react-query';

export function EventView() {
    const { event_id } = useParams();

    const { data, error, isLoading } = useQuery({
        queryKey: [`event-${event_id}`],
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


    if (!data.role) {
        //Unjoined event. Show the join button.
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

type JudgeViewProps = {
    event: EventDetails
}

const JudgeView: React.FC<JudgeViewProps> = (e) =>
{
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
                  <p>Registered players</p>
              </div>
          </div>
        </>
      )
  }