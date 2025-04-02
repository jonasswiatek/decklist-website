import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { EventDetails, getEvent } from '../../model/api/apimodel';
import { JudgeView } from './Views/JudgeView';
import { DeckEditor } from './DeckView';
import { EventViewProps } from './EventTypes';
import { useAuth } from '../Login/useAuth';

// New EventHeader component
const EventHeader: React.FC<{ eventName: string, eventId: string, role?: string }> = ({ eventName, eventId, role }) => {
    const showEventId = role === "owner" || role === "judge";
    
    return (
        <div className='row'>
            <div className='col'>
                <h1>
                    <span>{eventName}</span>
                    {showEventId && (
                        <small className="text-muted float-end d-none d-md-inline">
                            <span className="badge bg-primary user-select-all">{eventId.toUpperCase()}</span>
                        </small>
                    )}
                </h1>
                <br></br>
            </div>
        </div>
    );
};

// Event Full Message component
const EventFullMessage: React.FC = () => {
    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="alert alert-warning text-center">
                        <h5 className="alert-heading">Event is Full</h5>
                        <p className="mb-0">
                            This event has reached its maximum player capacity. Please contact the Tournament Organizer if you believe you should still be able to register.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function EventView() {
    const { event_id } = useParams();
    const { authorized } = useAuth();

    const { data, error, isLoading, refetch } = useQuery<EventDetails>({
        queryKey: [`event-${event_id}`],
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () => getEvent(event_id!),
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
        {(data.player_count >= data.max_players) ? 
            <EventFullMessage /> : 
            (authorized ? <DeckEditor event={data} user_id={null} showEditor={false} /> : <UnauthedView event={data} />)
        }
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