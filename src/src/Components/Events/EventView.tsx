import { useNavigate, useParams } from 'react-router-dom';
import { JudgeView } from './Views/JudgeView';
import { DeckEditor } from './DeckView';
import { EventViewProps } from './EventTypes';
import { useAuth } from '../Login/useAuth';
import { LoadingScreen } from '../Login/LoadingScreen';
import { BsArrowLeft } from 'react-icons/bs';
import { useEventDetailsQuery } from '../../Hooks/useEventDetailsQuery';

// New EventHeader component
const EventHeader: React.FC<{ eventName: string, eventId: string, role?: string }> = ({ eventName, eventId, role }) => {
    const showEventId = role === "owner" || role === "judge";
    const navigate = useNavigate();

    return (
        <div className='row'>
            <div className='col'>
                <div className="mb-3">
                    <button 
                        type="button" 
                        className="btn btn-link text-decoration-none p-0" 
                        onClick={() => navigate('/')}
                    >
                        <BsArrowLeft className="me-1" /> Events
                    </button>
                </div>
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

    const { data, error, isLoading, refetch } = useEventDetailsQuery(event_id!);
    
    if (isLoading) {
        return (
            <LoadingScreen />
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
            (authorized ? <DeckEditor event={data} user_id={null} /> : <UnauthedView event={data} />)
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
                    {!isEventOpen ? (
                        <div className="alert alert-warning shadow-sm">
                            <h5 className="alert-heading">
                                Event Closed
                            </h5>
                            <p className="mb-0">
                                This event has been closed for registration. If you need to participate, please contact your Tournament Organiser or Judge.
                            </p>
                        </div>
                    ) : (
                        <div className="card shadow-sm bg-dark text-light">
                            <div className="card-body text-center py-4">
                                <i className="bi bi-person-badge fs-1 text-info mb-3"></i>
                                <p className="card-text mb-4">
                                    Log in submit your decklist for this event.
                                </p>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-light" 
                                    onClick={login}
                                >
                                    Log in to Continue
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}