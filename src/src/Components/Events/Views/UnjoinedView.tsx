import React from 'react';
import { joinEventRequest } from '../../../model/api/apimodel';
import { useAuth } from '../../Login/AuthContext';
import { EventViewProps } from '../EventTypes';

export const UnjoinedView: React.FC<EventViewProps> = (e) => {
    const { login, authorized } = useAuth();

    const joinEvent = async () => {
        await joinEventRequest({event_id: e.event.event_id});
        e.refetch!();
    };

    return (
        <>
          <div className='row'>
              <div className='col'>
                  <p>{e.event.event_name}</p>
              </div>
          </div>
          {authorized ? 
          (
            <div className='row'>
                <div className='col'>
                    <button type="button" className="btn btn-primary" onClick={joinEvent}>Join event</button>
                </div>
            </div>
          ) :
          (
            <div className='row'>
                <div className='col'>
                    <p>Log in to join this event</p>
                    <button type="button" className="btn btn-primary" onClick={login}>Log in</button>
                </div>
            </div>
          )
        }
        </>
    )
}
