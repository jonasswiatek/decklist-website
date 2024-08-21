
import { useParams } from 'react-router-dom';
import { EventDetails, joinEventRequest, updateEventUsers } from '../../model/api/apimodel';
import { useQuery } from 'react-query';
import { SubmitHandler, useForm } from 'react-hook-form';
import { HandleValidation } from '../../Util/Validators';

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
    

    return (
        <>
        <div className='row'>
            <div className='col'>
                <p>Decklist view</p>
                <div className='row'>
                    <div className='col-md-auto'>
                        ddddddddd
                    </div>
                    <div className='col col-lg-2'>
                        <div className="btn-toolbar mb-3" role="toolbar" aria-label="Toolbar with button groups">
                            <div className="btn-group me-2" role="group" aria-label="First group">
                                <button type="button" className="btn btn-outline-secondary">1</button>
                                <button type="button" className="btn btn-outline-secondary">2</button>
                                <button type="button" className="btn btn-outline-secondary">3</button>
                                <button type="button" className="btn btn-outline-secondary">4</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-auto'>
                        ddddddddd
                    </div>
                    <div className='col col-lg-2'>
                        <div className="btn-toolbar mb-3" role="toolbar" aria-label="Toolbar with button groups">
                            <div className="btn-group me-2" role="group" aria-label="First group">
                                <button type="button" className="btn btn-outline-secondary">1</button>
                                <button type="button" className="btn btn-outline-secondary">2</button>
                                <button type="button" className="btn btn-outline-secondary">3</button>
                                <button type="button" className="btn btn-outline-secondary">4</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-auto'>
                        ddddddddd
                    </div>
                    <div className='col col-lg-2'>
                        <div className="btn-toolbar mb-3" role="toolbar" aria-label="Toolbar with button groups">
                            <div className="btn-group me-2" role="group" aria-label="First group">
                                <button type="button" className="btn btn-outline-secondary">1</button>
                                <button type="button" className="btn btn-outline-secondary">2</button>
                                <button type="button" className="btn btn-outline-secondary">3</button>
                                <button type="button" className="btn btn-outline-secondary">4</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-auto'>
                        ddddddddd
                    </div>
                    <div className='col col-lg-2'>
                        <div className="btn-toolbar mb-3" role="toolbar" aria-label="Toolbar with button groups">
                            <div className="btn-group me-2" role="group" aria-label="First group">
                                <button type="button" className="btn btn-outline-secondary">1</button>
                                <button type="button" className="btn btn-outline-secondary">2</button>
                                <button type="button" className="btn btn-outline-secondary">3</button>
                                <button type="button" className="btn btn-outline-secondary">4</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </>
    )
}

const OwnerView: React.FC<EventViewProps> = (e) => {
    type Inputs = {
        email: string
    };

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
                                        <tr><button type="button" className="btn btn-danger" onClick={async () => onRemove(p.email)}>Remove</button></tr>
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
                    </tr>
                    </thead>
                    <tbody>
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
                    </tbody>
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