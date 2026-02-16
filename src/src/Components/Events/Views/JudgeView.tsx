import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BsQrCode, BsClipboard, BsCheck, BsLockFill, BsUnlockFill, BsSearch, BsPersonPlus, BsChevronDown, BsChevronUp, BsDownload, BsTrash, BsExclamationTriangleFill, BsCheckCircleFill } from 'react-icons/bs';
import { HandleValidation } from '../../../Util/Validators';
import { EventViewProps } from '../EventTypes';
import { useAuth } from '../../Login/useAuth';
import { useEventListQuery } from '../../../Hooks/useEventListQuery';
import { useEventUpdated } from '../../../Hooks/useWebsocketConnection';
import { useUpdateEventMutation, useDeleteEventMutation, useDeleteEventUserMutation, useAddJudgeMutation, useAddPlayerMutation } from '../../../Hooks/useEventMutations';

export const JudgeView: React.FC<EventViewProps> = (e) => {
    const players = e.event.participants.filter(a => a.role === "player");
    const judges = e.event.participants.filter(a => a.role === "judge");
    const [copied, setCopied] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddDeckForm, setShowAddDeckForm] = useState(false);
    const [showAddJudgeForm, setShowAddJudgeForm] = useState(false);
    const inviteLink = `${window.location.origin}/e/${e.event.event_id}`;
    const navigate = useNavigate();
    const auth = useAuth();
    const [filterByDeckStatus, setFilterByDeckStatus] = useState<'all' | 'checked' | 'unchecked' | 'warnings'>('all');
    const { refetch: refetchMyEvents } = useEventListQuery(false);
    const { refetch: refetchEvent } = e;

    useEventUpdated((message) => {
        if(refetchEvent && message.refresh && message.updated_by_session_id != auth.sessionId) {
            console.log("Refetching event");
            refetchEvent();
        }
    }, e.event.event_id);

    // Filtered players based on search term and deck status
    const filteredPlayers = players.filter(player => {
        const matchesSearch = player.player_name.toLowerCase().includes(searchTerm.trim().toLowerCase());
        const matchesDeckStatus = 
            filterByDeckStatus === 'all' ||
            (filterByDeckStatus === 'checked' && player.is_deck_checked) ||
            (filterByDeckStatus === 'unchecked' && !player.is_deck_checked) ||
            (filterByDeckStatus === 'warnings' && player.has_deck_warning);
        return matchesSearch && matchesDeckStatus;
    });

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const updateEventMutation = useUpdateEventMutation({
        onSuccess: () => e.refetch?.(),
    });

    const deleteEventMutation = useDeleteEventMutation({
        onSuccess: () => {
            refetchMyEvents();
            navigate('/');
        },
    });

    const deleteEventUserMutation = useDeleteEventUserMutation({
        onSuccess: () => e.refetch!(),
    });

    const toggleEventState = () => {
        const isOpen = e.event.status === "open";

        // Judges can only close events, not reopen them
        if (e.event.role === "judge" && isOpen) {
            const confirmed = window.confirm(
                "As a judge, you can close this tournament but cannot reopen it.\n\n" +
                "Only the tournament owner can reopen a closed tournament.\n\n" +
                "Are you sure you want to close this tournament?"
            );

            if (!confirmed) return;
        }

        // Only proceed if owner (who can do both) or judge closing the event
        if (e.event.role === "owner" || isOpen) {
            updateEventMutation.mutate({
                params: { path: { eventId: e.event.event_id } },
                body: { event_status: isOpen ? "closed" : "open" },
            });
        }
    };

    const handleDeleteEvent = () => {
        const confirmed = window.confirm("Are you sure you want to delete this tournament? This action cannot be undone.");
        if (confirmed) {
            deleteEventMutation.mutate({
                params: { path: { eventId: e.event.event_id } },
            });
        }
    };

    const handleDownloadDecklists = () => {
        // Simply open the URL in a new tab, browser will handle the download
        window.open(`/api/events/${e.event.event_id}/decks/all`, '_blank');
    };

    const { register, reset, setError, handleSubmit, clearErrors, formState: { errors } } = useForm<{player_name: string, email: string}>();
    const addJudgeMutation = useAddJudgeMutation({
        onSuccess: () => {
            e.refetch!();
            reset();
        },
        onError: (err) => HandleValidation(setError, err),
    });
    const onAddJudge = (data: {player_name: string, email: string}) => {
        addJudgeMutation.mutate({
            params: { path: { eventId: e.event.event_id } },
            body: {
                email: data.email.trim(),
                player_name: data.player_name.trim(),
                role: "judge",
            },
        });
    };

    // Handler for adding a player
    const { register: registerPlayer, handleSubmit: handleSubmitPlayer, reset: resetPlayer, setError: setPlayerError, clearErrors: clearPlayerErrors, formState: { errors: playerErrors } } = useForm<{player_name: string, email: string}>();
    const addPlayerMutation = useAddPlayerMutation({
        onSuccess: (response) => {
            resetPlayer();
            if (response && response.user_id) {
                navigate(`/e/${e.event.event_id}/deck?id=${response.user_id}`);
            } else {
                e.refetch?.();
            }
        },
        onError: (err) => HandleValidation(setPlayerError, err),
    });
    const onAddPlayer = (data: {player_name: string, email: string}) => {
        addPlayerMutation.mutate({
            params: { path: { eventId: e.event.event_id } },
            body: {
                email: data.email?.trim() || undefined,
                player_name: data.player_name.trim(),
            },
        });
    };

    const onRemovePlayer = (userId: string, playerName: string) => {
        const confirmed = window.confirm(`Are you sure you want to remove ${playerName} from the tournament?`);

        if (confirmed) {
            deleteEventUserMutation.mutate({
                params: { path: { eventId: e.event.event_id } },
                body: { user_id: userId },
            });
        }
    };

    const disassociateSelfMutation = useDeleteEventUserMutation({
        onSuccess: () => {
            refetchMyEvents();
            navigate('/');
        },
    });

    const onDisassociateSelf = () => {
        const confirmed = window.confirm(`Are you sure you want to leave this event?`);

        if (confirmed) {
            disassociateSelfMutation.mutate({
                params: { path: { eventId: e.event.event_id } },
                body: { user_id: auth.userId! },
            });
        }
    };

    return (
        <>
        <div className="container">
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
                                            placeholder="Player Name" 
                                            required
                                            {...registerPlayer("player_name")} 
                                        />
                                        {playerErrors.player_name && <div className="text-danger mt-1">{playerErrors.player_name.message}</div>}
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
                                        <button 
                                            type="submit" 
                                            className="btn btn-success" 
                                            disabled={addPlayerMutation.isPending}
                                        >
                                            {addPlayerMutation.isPending ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Adding...
                                                </>
                                            ) : 'Add Deck'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    <table className="table table-striped table-hover">
                    <thead className="table-dark">
                    <tr>
                        <th>Players ({players.length}/{e.event.max_players})</th>
                        <th className="text-end">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {players.length > 0 && (
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
                                <div className="btn-group w-100 mt-2">
                                    <button 
                                        className={`btn btn-outline-secondary px-1 py-1 ${filterByDeckStatus === 'all' ? 'active' : ''}`} 
                                        onClick={() => setFilterByDeckStatus('all')}
                                    >
                                        All
                                    </button>
                                    <button 
                                        className={`btn btn-outline-secondary px-1 py-1 ${filterByDeckStatus === 'checked' ? 'active' : ''}`} 
                                        onClick={() => setFilterByDeckStatus('checked')}
                                    >
                                        Checked
                                    </button>
                                    <button 
                                        className={`btn btn-outline-secondary px-1 py-1 ${filterByDeckStatus === 'unchecked' ? 'active' : ''}`} 
                                        onClick={() => setFilterByDeckStatus('unchecked')}
                                    >
                                        Unchecked
                                    </button>
                                    <button 
                                        className={`btn btn-outline-secondary px-1 py-1 ${filterByDeckStatus === 'warnings' ? 'active' : ''}`} 
                                        onClick={() => setFilterByDeckStatus('warnings')}
                                    >
                                        Warnings
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                    {filteredPlayers.length > 50 && searchTerm === '' && (
                        <tr>
                            <td colSpan={2} className="text-center py-3 bg-warning-subtle">
                                Showing first 50 of {filteredPlayers.length} players. Please use the search bar to find specific players.
                            </td>
                        </tr>
                    )}
                    {(searchTerm !== '' ? filteredPlayers : filteredPlayers.slice(0, 50)).map((p) => {
                        return (
                            <tr key={p.user_id}>
                                <td 
                                    className="align-middle" 
                                    onClick={() => navigate('/e/' + e.event.event_id + '/deck?id=' + p.user_id)}
                                    style={{ cursor: 'pointer' }}
                                    title="View deck"
                                >
                                    {p.player_name}
                                </td>
                                <td className="text-end align-middle">
                                    <div className="d-flex justify-content-end align-items-center">
                                        {p.has_deck_warning && (
                                            <BsExclamationTriangleFill className="text-warning me-2" title="Warning" />
                                        )}
                                        {p.is_deck_checked && (
                                            <BsCheckCircleFill className="text-success me-2" title="Checked" />
                                        )}
                                        <Link 
                                            to={'/e/' + e.event.event_id + '/deck?id=' + p.user_id} 
                                            className="btn btn-sm btn-primary me-2"
                                            title="View Deck"
                                        >
                                            <BsSearch />
                                        </Link>
                                        <button 
                                            type="button" 
                                            className="btn btn-sm btn-danger" 
                                            onClick={async () => onRemovePlayer(p.user_id, p.player_name)}
                                            title="Remove Player"
                                        >
                                            <BsTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                    {filteredPlayers.length === 0 && (
                        <tr>
                            <td colSpan={2} className="text-center py-3">
                                {players.length <= 0 
                                    ? "No players have joined this tournament yet" 
                                    : "No players match your filter"}
                            </td>
                        </tr>
                    )}
                    </tbody>
                    </table>
                </div>
                <div className='col-12 col-lg-6'>
                    <h2 className="mb-3">Tournament</h2>
                    
                    <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
                        <div style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '70%'
                        }}>
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
                            <strong>Tournament Information</strong>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-6 mb-3">
                                    <div className="fw-bold">Format:</div>
                                    <div>{e.event.format_name}</div>
                                </div>
                                <div className="col-6 mb-3">
                                    <div className="fw-bold">Participants:</div>
                                    <div>{players.length} / {e.event.max_players}</div>
                                </div>
                                <div className="col-6 mb-3">
                                    <div className="fw-bold">Tournament Date:</div>
                                    <div>{new Date(e.event.event_date).toLocaleDateString()}</div>
                                </div>
                                <div className="col-6 mb-3">
                                    <div className="fw-bold">Expiration Date:</div>
                                    <div>
                                        {
                                            (() => {
                                                const deletionDate = new Date(e.event.event_date);
                                                deletionDate.setDate(deletionDate.getDate() + 7);
                                                return deletionDate.toLocaleDateString();
                                            })()
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card mb-4">
                        <div className="card-header">
                            <strong>Status</strong>
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
                                    "Players can submit and modify decks when the tournament is open." : 
                                    "Players cannot submit or modify decks when the tournament is closed."}
                            </p>
                            {e.event.role === "judge" && e.event.status != "open" && (
                                <div className="alert alert-warning mt-3 mb-0">
                                    <small>
                                        Only the tournament owner can reopen this tournament.
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="card mb-4">
                        <div className="card-header">
                            <strong>Utilities</strong>
                        </div>
                        <div className="card-body">
                            <div className="d-flex flex-column gap-3">
                                <div>
                                    <button 
                                        type="button" 
                                        className="btn btn-primary d-flex align-items-center"
                                        onClick={handleDownloadDecklists}
                                    >
                                        <BsDownload className="me-2" /> Download All Decklists
                                    </button>
                                    <p className="mt-2 mb-0 small text-muted">
                                        Download all decklists as a single text file for offline use or printing.
                                    </p>
                                </div>
                                <div>
                                    <Link 
                                        to={`/e/${e.event.event_id}/sync/eventlink`}
                                        className="btn btn-primary d-flex align-items-center"
                                        style={{ width: "fit-content" }}
                                    >
                                        Eventlink Sync
                                    </Link>
                                    <p className="mt-2 mb-0 small text-muted">
                                        Cross reference submissions with eventlink player list.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card mb-4">
                        <div className="card-header">
                            <strong>Danger Zone</strong>
                        </div>
                        <div className="card-body">
                            {e.event.role === "owner" ? (
                                <>
                                    <p className="text-muted mb-3">
                                        Deleting a tournament will permanently remove all related data including decks and user registrations.
                                    </p>
                                    <button 
                                        type="button" 
                                        className="btn btn-danger"
                                        onClick={handleDeleteEvent}>
                                        Delete Tournament
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-muted mb-3">
                                        Leaving the event will remove you as a judge. You will no longer have access to manage this tournament.
                                    </p>
                                    <button 
                                        type="button" 
                                        className="btn btn-danger"
                                        onClick={onDisassociateSelf}>
                                        Leave Event
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {(e.event.role === "owner") && (
                        <>
                            <h2 className="mb-3">Judges</h2>

                            <div className="card mb-3">
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
                                        <form onSubmit={(e) => { clearErrors(); handleSubmit(onAddJudge)(e); }} >
                                            <div className="mb-3">
                                                <input id='player_name' type="text" className="form-control" placeholder="Judge Name" required {...register("player_name")} />
                                                {errors.player_name && <p className="text-danger mt-2">{errors.player_name?.message}</p>}
                                            </div>
                                            <div className="mb-3">
                                                <input id='email' type="text" className="form-control" placeholder="Email Address" required {...register("email")} />
                                                {errors.email && <p className="text-danger mt-2">{errors.email?.message}</p>}
                                            </div>
                                            <button 
                                                type='submit' 
                                                className='btn btn-success'
                                                disabled={addJudgeMutation.isPending}
                                            >
                                                {addJudgeMutation.isPending ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Adding...
                                                    </>
                                                ) : 'Add Judge'}
                                            </button>
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
                                                <div className="d-flex justify-content-end align-items-center">
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-danger" 
                                                        onClick={async () => onRemovePlayer(p.user_id, p.player_name)}
                                                        title="Remove Judge"
                                                    >
                                                        <BsTrash />
                                                    </button>
                                                </div>
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
        </div>
        </>
    )
}
