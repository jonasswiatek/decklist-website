import { useParams, useNavigate, Link } from 'react-router-dom';
import { EventDetails, joinEventRequest, updateEventUsers, submitDecklistRequest, deleteEvent, DecklistResponse } from '../../model/api/apimodel';
import { useQuery } from 'react-query';
import { SubmitHandler, useForm } from 'react-hook-form';
import { HandleValidation } from '../../Util/Validators';
import { useAuth } from '../Login/AuthContext';
import { Collapse, Button } from 'react-bootstrap';
import { useState } from 'react';
import { DecklistTable } from './DecklistTable';

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

    if (data.role === "owner") {
        //Being viewed by the owner or a judge.
        return (
            <>
                <OwnerView event={data} refetch={refetch} />
                <JudgeView event={data} />
            </>
        )
    }

    if (data.role === "judge") {
        //Being viewed by the owner or a judge.
        return (
            <JudgeView event={data} />
        )
    }
    
    //Joined player - show the decklist editor.
    return (
      <>
        <div className='row'>
            <div className='col'>
                <p>{data.event_name}</p>
            </div>
        </div>
        <DecklistEditor event={data} />
      </>
    )
}

type EventViewProps = {
    event: EventDetails,
    refetch?: () => void
}

const DecklistEditor: React.FC<EventViewProps> = (e) => {
    type Inputs = {
        player_name: string,
        decklist_text: string
    };

    const { data, error, isLoading, refetch } = useQuery({
        queryKey: [`deck-${e.event.event_id}`],
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () =>
            fetch(`/api/events/${e.event.event_id}/deck`).then(async (res) => {
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

    const { register, setError, handleSubmit, clearErrors, reset, formState: { errors, isDirty } } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = async data => {
        try {
            await submitDecklistRequest({ event_id: e.event.event_id, player_name: data.player_name, decklist_text: data.decklist_text });
            refetch();
            reset(data);
        }
        catch(e) {
            console.log("handle val", e);
            HandleValidation(setError, e);
        }
    }

    const [open, setOpen] = useState(false);

    if (isLoading) {
        return <p>Loading...</p>
    }

    if (error != null) {
        return <p>Error, try later</p>
    }

    const mainboardCount = data?.mainboard.reduce((acc, val) => acc + val.quantity, 0);
    const sideboardCount = data?.sideboard.reduce((acc, val) => acc + val.quantity, 0);

    return (
        <>
        <div className='row'>
            <div className='col'>
                <form onSubmit={(e) => { clearErrors(); handleSubmit(onSubmit)(e); }} >
                    <div className="form-group d-flex align-items-center">
                        <label htmlFor="player_name" className="me-2">Player Name:</label>
                        <input type='text' id="player_name" className='form-control' placeholder='Your name' required {...register("player_name", { value: data?.player_name })} style={{ width: 'auto' }} />
                    </div>
                    <div className="form-group">
                        <Button onClick={() => setOpen(!open)} aria-controls="example-collapse-text" aria-expanded={open}>click</Button>
                        <Collapse in={open}>
                            <div>
                                <label htmlFor="decklist_text">Decklist:</label>
                                <textarea id='decklist_text' className="form-control" placeholder="3 Sheoldred, the Apocalypse" required {...register("decklist_text", { value: data?.decklist_text })} style={{ width: 'auto' }} />
                            </div>
                        </Collapse>
                   </div>
                    {errors.decklist_text && <p>{errors.decklist_text?.message}</p>}
                    <div className="submit-button-wrapper float-bottom" id='bottom-bar'>
                    <div>
                        <span style={{margin: 5}}>Main: {mainboardCount}</span>
                        <span style={{margin: 5}}>Side: {sideboardCount}</span>
                    </div>
                    {isDirty ? <button type='submit' className='btn btn-primary' id='submit-button'>Save</button> : <></>}
                </div>
                </form>
            </div>
        </div>
        <div className='row'>
            <div className='col decklist-table-container'>
                <DecklistTable mainboard={data?.mainboard} sideboard={data?.sideboard} />
            </div>
        </div>
      </>
    )
}

const OwnerView: React.FC<EventViewProps> = (e) => {
    type Inputs = {
        email: string
    };

    const navigate = useNavigate();
    const { register, reset, setError, handleSubmit, clearErrors, formState: { errors } } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = async data => {
        try {
            await updateEventUsers({ event_id: e.event.event_id, email: data.email, role: 'judge' });
            e.refetch!();
            reset();
        }
        catch(e) {
            HandleValidation(setError, e);
        }
    }

    const onRemove = async (email: string) => {
        await updateEventUsers({ event_id: e.event.event_id, email: email, role: 'none' });
        e.refetch!();
    }
    
    const onDeleteEvent = async () => {
        await deleteEvent({event_id: e.event.event_id});
        navigate('/events');
    }

    return (
        <>
            <div className='row'>
                <div className='col'>
                    <p>Add Judge</p>
                    <form onSubmit={(e) => { clearErrors(); handleSubmit(onSubmit)(e); }} >
                        <input id='event_name' type="text" className="form-control" placeholder="Email Address" required {...register("email")} />
                        {errors.email && <p>{errors.email?.message}</p>}
                        <button type='submit' className='btn btn-primary'>Add judge</button>
                    </form>
                </div>
            </div>
            <div className='row'>
                <div className='col'>
                    <h2>Administrators</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>Email</th>
                            <th>Role</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {e.event.participants?.filter(a => a.role == "judge").map((p) => {
                            return (
                                <>
                                    <tr>
                                        <td>{p.email}</td>
                                        <td>{p.role}</td>
                                        <td><button type="button" className="btn btn-danger" onClick={async () => onRemove(p.email)}>Remove</button></td>
                                    </tr>
                                </>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='row'>
                <div className='row'>
                    <button type="button" className="btn btn-danger" onClick={onDeleteEvent}>Delete Event</button>
                </div>
            </div>
        </>
    )
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
                  <h2>Players</h2>
                  <table>
                    <thead>
                    <tr>
                        <th>Email</th>
                        <th>Deck submitted</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {e.event.participants?.filter(a => a.role == "player").map((p) => {
                        return (
                            <>
                                <tr>
                                    <td>{p.email}</td>
                                    <td>{p.deck_submitted ? 'Yes' : 'No'}</td>
                                    <td>{p.deck_submitted ? <Link to={'/events/' + e.event.event_id + '/deck?id=' + p.user_id}>Show</Link> : ''}</td>
                                </tr>
                            </>
                        )
                    })}
                    </tbody>
                  </table>
              </div>
          </div>
        </>
    )
}

const UnjoinedView: React.FC<EventViewProps> = (e) => {
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
