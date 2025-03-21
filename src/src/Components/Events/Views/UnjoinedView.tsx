import React from 'react';
import { joinEventRequest } from '../../../model/api/apimodel';
import { useAuth } from '../../Login/AuthContext';
import { EventViewProps } from '../EventTypes';

export const UnjoinedView: React.FC<EventViewProps> = (e) => {
    const { login, authorized } = useAuth();

    const isEventOpen = e.event.status === 'open';

    const joinEvent = async () => {
        await joinEventRequest({event_id: e.event.event_id});
        e.refetch!();
    };

    return (
        <div className="container py-4">
            <div className="text-center mb-4">
                <h3>{e.event.event_name}</h3>
            </div>
            
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="text-center py-3">
                        {!isEventOpen ? (
                            <div className="alert alert-warning">
                                <p className="mb-0">
                                    This event has been closed for registration. If you need to participate, please contact your Tournament Organiser or Judge.
                                </p>
                            </div>
                        ) : authorized ? (
                            <>
                                <p className="mb-3">
                                    You're not currently registered for this event. Register for this event to submit your decklist and participate.
                                </p>
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={joinEvent}
                                >
                                    Register for event
                                </button>
                                <p className="mt-3 small">
                                    After registering, you'll be able to submit and edit your decklist for this event.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="mb-3">
                                    You need to log in to register for this event and submit your decklist.
                                </p>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-primary" 
                                    onClick={login}
                                >
                                    Log in
                                </button>
                                <p className="mt-3 small">
                                    Once logged in, you'll be able to register for events and manage your decklists.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
