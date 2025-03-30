import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { EventDetails } from '../../model/api/apimodel';
import { JudgeView } from './Views/JudgeView';
import { useAuth } from '../Login/AuthContext';
import { DeckEditor } from './DeckView';
import { EventViewProps } from './EventTypes';

// New EventHeader component
const EventHeader: React.FC<{ eventName: string, eventId: string, role?: string }> = ({ eventName, eventId, role }) => {
    const showEventId = role === "owner" || role === "judge";
    
    return (
        <div className='row'>
            <div className='col'>
                <h1>
                    {eventName} 
                    {showEventId && (
                        <small className="text-muted float-end d-none d-md-inline">
                            <span className="badge bg-primary">{eventId.toUpperCase()}</span>
                        </small>
                    )}
                </h1>
                <br></br>
            </div>
        </div>
    );
};

export function EventView() {
    const { event_id } = useParams();
    const { authorized } = useAuth();

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

    if (data.role === "owner" || data.role === "judge") {
        //Being viewed by a judge.
        return (
            <>
                <EventHeader eventName={data.event_name} eventId={data.event_id} role={data.role} />
                <JudgeView event={data} refetch={refetch} />
            </>
        )
    }
    
    return (
      <>
        <EventHeader eventName={data.event_name} eventId={data.event_id} role={data.role} />
        { authorized ? <DeckEditor event={data} user_id={null} showEditor={false} /> : <UnauthedView event={data} /> }
      </>
    )
}


const UnauthedView: React.FC<EventViewProps> = (props) => {
    const { login } = useAuth();

    const isEventOpen = props.event.status === 'open';

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="text-center py-3">
                        {!isEventOpen ? (
                            <div className="alert alert-warning">
                                <p className="mb-0">
                                    This event has been closed for registration. If you need to participate, please contact your Tournament Organiser or Judge.
                                </p>
                            </div>
                        ) :  (
                            <>
                                <p className="mb-3">
                                    You need to log in to submit your decklist.
                                </p>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-primary" 
                                    onClick={login}
                                >
                                    Log in
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}