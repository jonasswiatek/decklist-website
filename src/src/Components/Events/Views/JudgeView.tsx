import React from 'react';
import { Link } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BsMailbox } from 'react-icons/bs';
import { BsQrCode } from 'react-icons/bs'; 
import { updateEventUsers } from '../../../model/api/apimodel';
import { HandleValidation } from '../../../Util/Validators';
import { EventViewProps } from '../EventTypes';

export const JudgeView: React.FC<EventViewProps> = (e) => {
    const players = e.event.participants.filter(a => a.role === "player");
    const judges = e.event.participants.filter(a => a.role === "judge");
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
        <div className='row' style={{paddingBottom: 40}}>
            <div className='col'>
                <div className="alert alert-info d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Invite Link:</strong> https://decklist.lol/e/{e.event.event_id}
                    </div>
                    <Link 
                        to={`/e/${e.event.event_id}/qr`} 
                        className="btn btn-primary d-flex align-items-center"
                    >
                        <BsQrCode className="me-2" /> Show QR Code
                    </Link>
                </div>
            </div>
        </div>
        <div className='row'>
            <div className='col'>
                <h2 className="mb-3">Decks</h2>
                <table className="table table-striped table-hover">
                <thead className="table-dark">
                <tr>
                    <th>Player Name</th>
                    <th>Deck submitted</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {players.map((p) => {
                    return (
                        <tr key={p.user_id}>
                            <td>{p.player_name ? p.player_name : p.email}</td>
                            <td>
                                {p.deck_submitted ? 
                                    <span className="badge bg-success">Yes</span> : 
                                    <span className="badge bg-warning text-dark">No</span>}
                            </td>
                            <td>{p.deck_submitted ? 
                                <Link to={'/e/' + e.event.event_id + '/deck?id=' + p.user_id} className="btn btn-sm btn-primary">
                                    View Deck
                                </Link> : ''}
                            </td>
                        </tr>
                    )
                })}
                </tbody>
                </table>
            </div>
            <div className='col'>
                <h2 className="mb-3">Judges</h2>
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {judges.map((p) => {
                        return (
                            <tr key={p.user_id}>
                                <td>{p.email}</td>
                                <td>
                                    <button type="button" className="btn btn-sm btn-danger" onClick={async () => onRemove(p.email)}>
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>

                <div className="card mt-4">
                    <div className="card-header">
                        <strong>Add Judge</strong>
                    </div>
                    <div className="card-body">
                        <form onSubmit={(e) => { clearErrors(); handleSubmit(onSubmit)(e); }} >
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-text" id="basic-addon1">
                                        <BsMailbox />
                                    </span>
                                    <input id='event_name' type="text" className="form-control" placeholder="Email Address" required {...register("email")} />
                                    <button type='submit' className='btn btn-success'>Add Judge</button>
                                </div>
                                {errors.email && <p className="text-danger mt-2">{errors.email?.message}</p>}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
