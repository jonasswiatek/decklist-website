import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BsQrCode, BsClipboard, BsCheck, BsLockFill, BsUnlockFill, BsSearch, BsPersonPlus, BsChevronDown, BsChevronUp } from 'react-icons/bs'; 
import { updateEventUsers, deleteEventUser, updateEvent, deleteEvent, addUserToEvent } from '../../../model/api/apimodel';
import { HandleValidation } from '../../../Util/Validators';
import { EventViewProps } from '../EventTypes';

export const JudgeView: React.FC<EventViewProps> = (e) => {
    const players = e.event.participants.filter(a => a.role === "player");
    const judges = e.event.participants.filter(a => a.role === "judge");
    const [copied, setCopied] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddDeckForm, setShowAddDeckForm] = useState(false);
    const [showAddJudgeForm, setShowAddJudgeForm] = useState(false);
    const inviteLink = `${window.location.origin}/e/${e.event.event_id}`;
    const navigate = useNavigate();

    // Form states for adding player
    const { register: registerPlayer, handleSubmit: handleSubmitPlayer, reset: resetPlayer, setError: setPlayerError, clearErrors: clearPlayerErrors, formState: { errors: playerErrors } } = useForm<{playerName: string, email: string}>();

    // Filtered players based on search term
    const filteredPlayers = players.filter(player => 
        player.player_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const toggleEventState = async () => {
        const isOpen = e.event.status === "open";
        
        // Judges can only close events, not reopen them
        if (e.event.role === "judge" && isOpen) {
            const confirmed = window.confirm(
                "As a judge, you can close this event but cannot reopen it.\n\n" +
                "Only the event owner can reopen a closed event.\n\n" +
                "Are you sure you want to close this event?"
            );

            console.log(confirmed);
            if (!confirmed) return;
        }
        
        // Only proceed if owner (who can do both) or judge closing the event
        if (e.event.role === "owner" || isOpen) {
            await updateEvent(e.event.event_id, { 
                event_status: isOpen ? "closed" : "open"
            });

            if (e.refetch) {
                e.refetch();
            }
        }
    };

    const handleDeleteEvent = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this event? This action cannot be undone.");
        if (confirmed) {
            await deleteEvent({ event_id: e.event.event_id });
            // Navigate back to the events list using React Router
            navigate('/');
        }
    };

    type Inputs = {
        email: string,
        playerName: string
    };

    const { register, reset, setError, handleSubmit, clearErrors, formState: { errors } } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = async data => {
        try {
            await updateEventUsers({ event_id: e.event.event_id, email: data.email, player_name: data.playerName, role: 'judge' });
            e.refetch!();
            reset();
        }
        catch(e) {
            HandleValidation(setError, e);
        }
    }

    const onRemove = async (userId: string, playerName: string) => {
        const displayName = playerName;
        const confirmed = window.confirm(`Are you sure you want to remove ${displayName} from the event?`);
        
        if (confirmed) {
            await deleteEventUser(e.event.event_id, userId);
            e.refetch!();
        }
    }

    // Handler for adding a player
    const onAddPlayer: SubmitHandler<{playerName: string, email: string}> = async data => {
        try {
            const response = await addUserToEvent({ 
                eventId: e.event.event_id, 
                email: data.email || undefined, 
                playerName: data.playerName, 
            });
            
            resetPlayer();
            
            if (response && response.user_id) {
                // Navigate to the player's deck page
                navigate(`/e/${e.event.event_id}/deck?id=${response.user_id}&showEditor=true`);
            } else {
                e.refetch?.();
            }
        } catch(err) {
            HandleValidation(setPlayerError, err);
        }
    }

    return (
        <>
        <div className='row'>
            <div className='col-12 col-lg-6 mb-4'>
                <h2 className="mb-3">Decks</h2>
                
                {/* Add Player Form */}
                <div className="card mb-3">
                    <div 
                        className="card-header d-flex align-items-center justify-content-between cursor-pointer" 
                        onClick={() => setShowAddDeckForm(!showAddDeckForm)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="d-flex align-items-center">
                            <BsPersonPlus className="me-2" />
                            <strong>Manually Add Deck</strong>
                        </div>
                        {showAddDeckForm ? <BsChevronUp /> : <BsChevronDown />}
                    </div>
                    {showAddDeckForm && (
                        <div className="card-body">
                            <form onSubmit={(e) => { clearPlayerErrors(); handleSubmitPlayer(onAddPlayer)(e); }}>
                                <div className="mb-3">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Player Name *" 
                                        required
                                        {...registerPlayer("playerName")} 
                                    />
                                    {playerErrors.playerName && <div className="text-danger mt-1">{playerErrors.playerName.message}</div>}
                                </div>
                                <div className="mb-3">
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        placeholder="Email (optional)" 
                                        {...registerPlayer("email")} 
                                    />
                                    {playerErrors.email && <div className="text-danger mt-1">{playerErrors.email.message}</div>}
                                </div>
                                <div>
                                    <button type="submit" className="btn btn-success">Add Deck</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <table className="table table-striped table-hover">
                <thead className="table-dark">
                <tr>
                    <th>Players ({players.length})</th>
                    <th className="text-end">Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr className="bg-light">
                    <td colSpan={2}>
                        <div className="input-group my-2">
                            <span className="input-group-text">
                                <BsSearch />
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by player name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    className="btn btn-outline-secondary" 
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </td>
                </tr>
                {filteredPlayers.map((p) => {
                    return (
                        <tr key={p.user_id}>
                            <td>{p.player_name}</td>
                            <td className="text-end">
                                <div className="d-flex justify-content-end">
                                    <Link to={'/e/' + e.event.event_id + '/deck?id=' + p.user_id} className="btn btn-sm btn-primary me-2">
                                        View
                                    </Link>
                                    <button type="button" className="btn btn-sm btn-danger" onClick={async () => onRemove(p.user_id, p.player_name)}>
                                        Remove
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )
                })}
                {filteredPlayers.length === 0 && (
                    <tr>
                        <td colSpan={2} className="text-center py-3">
                            {searchTerm ? "No players match your search" : "No players have joined this event yet"}
                        </td>
                    </tr>
                )}
                </tbody>
                </table>
            </div>
            <div className='col-12 col-lg-6'>
                <h2 className="mb-3">Event</h2>
                
                <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <strong>Invite Link:</strong> {inviteLink}
                    </div>
                    <div className="d-flex align-items-center">
                        <button 
                            onClick={copyToClipboard} 
                            className="btn btn-primary d-flex align-items-center me-2"
                            title="Copy to clipboard"
                        >
                            {copied ? <BsCheck /> : <BsClipboard />}
                        </button>
                        
                        <Link 
                            to={`/e/${e.event.event_id}/qr`} 
                            className="btn btn-primary d-flex align-items-center"
                            title="Show QR code"
                            target="_blank" // Add this to open in a new window
                            rel="noopener noreferrer" // Add this for security best practices
                        >
                            <BsQrCode />
                        </Link>
                    </div>
                </div>
                
                <div className="card mb-4">
                    <div className="card-header">
                        <strong>Event Status</strong>
                    </div>
                    <div className="card-body">
                        <div className="d-flex align-items-center">
                            <div className="form-check form-switch me-3">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id="eventToggle" 
                                    checked={e.event.status == "open"} 
                                    onChange={toggleEventState}
                                    disabled={e.event.role === "judge" && e.event.status != "open"}
                                />
                                <label className="form-check-label" htmlFor="eventToggle">
                                    {e.event.status == "open" ? 
                                        <span className="text-success d-flex align-items-center">
                                            <BsUnlockFill className="me-1" /> Open
                                        </span> : 
                                        <span className="text-danger d-flex align-items-center">
                                            <BsLockFill className="me-1" /> Closed
                                        </span>
                                    }
                                </label>
                            </div>
                        </div>
                        <p className="mb-0 mt-2 text-muted">
                            {e.event.status == "open" ? 
                                "Players can submit and modify decks when the event is open." : 
                                "Players cannot submit or modify decks when the event is closed."}
                        </p>
                        {e.event.role === "judge" && e.event.status != "open" && (
                            <div className="alert alert-warning mt-3 mb-0">
                                <small>
                                    Only the event owner can reopen this event.
                                </small>
                            </div>
                        )}
                    </div>
                </div>
                
                {(e.event.role === "owner") && (
                    <>
                        <div className="card mb-4">
                            <div className="card-header">
                                <strong>Danger Zone</strong>
                            </div>
                            <div className="card-body">
                                <p className="text-muted mb-3">
                                    Deleting an event will permanently remove all related data including decks and user registrations.
                                </p>
                                <button 
                                    type="button" 
                                    className="btn btn-danger"
                                    onClick={handleDeleteEvent}>
                                    Delete Event
                                </button>
                            </div>
                        </div>
                        
                        <h2 className="mb-3">Judges</h2>

                        <div className="card mt-4">
                            <div 
                                className="card-header d-flex align-items-center justify-content-between"
                                onClick={() => setShowAddJudgeForm(!showAddJudgeForm)}
                                style={{ cursor: 'pointer' }}
                            >
                                <strong>Add Judge</strong>
                                {showAddJudgeForm ? <BsChevronUp /> : <BsChevronDown />}
                            </div>
                            {showAddJudgeForm && (
                                <div className="card-body">
                                    <form onSubmit={(e) => { clearErrors(); handleSubmit(onSubmit)(e); }} >
                                        <div className="mb-3">
                                            <input id='player_name' type="text" className="form-control" placeholder="Judge Name" required {...register("playerName")} />
                                            {errors.playerName && <p className="text-danger mt-2">{errors.playerName?.message}</p>}
                                        </div>
                                        <div className="mb-3">
                                            <input id='email' type="text" className="form-control" placeholder="Email Address" required {...register("email")} />
                                            {errors.email && <p className="text-danger mt-2">{errors.email?.message}</p>}
                                        </div>
                                        <button type='submit' className='btn btn-success'>Add Judge</button>
                                    </form>
                                </div>
                            )}
                        </div>
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th>Name</th>          
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                            {judges.map((p) => {
                                return (
                                    <tr key={p.user_id}>
                                        <td>{p.player_name}</td>
                                        <td className="text-end">
                                            <button type="button" className="btn btn-sm btn-danger" onClick={async () => onRemove(p.user_id, p.player_name)}>
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>

                    </>
                )}
            </div>
        </div>
        </>
    )
}
