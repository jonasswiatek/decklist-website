import React, { useState, useRef } from 'react';
import { useQuery } from 'react-query';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { DecklistResponse, deleteDeckRequest, EventDetails, getDecklistRequest, getEvent, submitDecklistRequest, setDeckChecked } from '../../model/api/apimodel';
import { DecklistTable } from './DecklistTable';
import { SubmitHandler, useForm } from 'react-hook-form';
import { HandleValidation } from '../../Util/Validators';
import { BsPerson } from 'react-icons/bs';
import { getDecklistPlaceholder } from '../../Util/DecklistPlaceholders';
import { LoadingScreen } from '../Login/LoadingScreen';

export function DeckView() {
    const { event_id } = useParams();
    const [ searchParams ] = useSearchParams();
    const id = searchParams.get('id');

    const { data, error, isLoading } = useQuery<EventDetails>({
        queryKey: [`event-${event_id}`],
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () => getEvent(event_id!)
    });
    
    if (isLoading) {
        return (
            <LoadingScreen />
        )
    }

    if(error) {
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
    
    return (<DeckEditor event={data!} user_id={id} />)
}

type DeckEditorProps = {
    event: EventDetails,
    user_id: string | null,
}

export const DeckEditor: React.FC<DeckEditorProps> = (props) => {
    const isJudge = props.user_id != null;
    const isOpen = props.event.status === "open" || isJudge;

    const [showToast, setShowToast] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false); // New state to track if the judge is editing

    const navigate = useNavigate();
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { data, error, isLoading, refetch } = useQuery<DecklistResponse | null>({
        queryKey: [`deck-${props.event.event_id}-${props.user_id}`],
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () => getDecklistRequest(props.event.event_id, props.user_id),
    });

    type Inputs = {
        user_id?: string,
        player_name: string,
        decklist_text: string
    };
 
    const { register, setError, handleSubmit, clearErrors, reset, formState: { errors, isDirty } } = useForm<Inputs>();
    const onSubmitDecklist: SubmitHandler<Inputs> = async data => {
        try {
            await submitDecklistRequest({ event_id: props.event.event_id, user_id: props.user_id, player_name: data.player_name, decklist_text: data.decklist_text });
            refetch();
            reset(data);
            
            // Show toast notification
            setShowToast(true);
            
            // Clear any existing timeout
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
            
            // Hide toast after 5 seconds
            toastTimeoutRef.current = setTimeout(() => {
                setShowToast(false);
            }, 3000);
        }
        catch(e) {
            console.log("handle val", e);
            HandleValidation(setError, e);
        }
    }

    const handleDeleteDeck = async () => {
        if (window.confirm("Are you sure you want to delete this deck? This action cannot be undone.")) {
            await deleteDeckRequest(props.event.event_id);
            refetch();
            reset({ player_name: '', decklist_text: '' });
        }
    };

    const handleBackToEvent = () => {
        navigate(`/e/${props.event.event_id}`);
    };

    const handleToggleDeckChecked = async (isChecked: boolean) => {
        if (props.user_id && isJudge) {
            await setDeckChecked({
                event_id: props.event.event_id,
                user_id: props.user_id,
                is_checked: isChecked
            });
            refetch();
        }
    };

    if (isLoading) {
        return <LoadingScreen />
    }

    if (error != null) {
        return <p>Error, try later</p>
    }

    if (isJudge && !data) {
        return <p>No decklist found</p>
    }

    // Calculate mainboard and sideboard counts
    const mainboardCount = data?.groups
        ? data.groups
            .filter(group => group.group_name !== "Sideboard")
            .flatMap(group => group.cards)
            .reduce((sum, card) => sum + card.quantity, 0)
        : 0;

    const sideboardCount = data?.groups
        ? data.groups
            .find(group => group.group_name === "Sideboard")?.cards
            .reduce((sum, card) => sum + card.quantity, 0) || 0
        : 0;

    const inputDisabled = (isJudge && !isEditing) || !isOpen;

    return (
        <>
        {isJudge && (
            <div className='row'>
                <div className='col-12 mb-3 d-flex justify-content-between align-items-center'>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={handleBackToEvent}
                    >
                        Back to Tournament
                    </button>
                    <button 
                        type="button" 
                        className={`btn ${data?.is_deck_checked ? 'btn-warning' : 'btn-success'}`} 
                        onClick={() => handleToggleDeckChecked(!data?.is_deck_checked)}
                    >
                        {data?.is_deck_checked ? 'Mark as Unchecked' : 'Mark as Checked'}
                    </button>
                </div>
                {data?.player_name && (
                    <div className='col-12 mb-3'>
                        <h3 className="deck-player-name">
                            <BsPerson className="me-2" />
                            {data.player_name}
                        </h3>
                    </div>
                )}
            </div>
        )}

        <form onSubmit={(e) => { clearErrors(); handleSubmit(onSubmitDecklist)(e); }} >
            <div className='row'>
                <div className='col-lg-4 col-sm-12'>
                    <div className="event-info mb-3 d-flex justify-content-between align-items-center">
                        <p className="mb-0"><strong>Format:</strong> {props.event.format_name}</p>
                        {data && !isJudge && (
                            <button 
                                type="button" 
                                className="btn btn-danger btn-sm" 
                                onClick={handleDeleteDeck}
                            >
                                Delete Deck
                            </button>
                        )}
                    </div>
                    {!isOpen && (
                        <div className="alert alert-info mb-3">The event is closed. Decklist cannot be modified.</div>
                    )}
                    
                    <div className="form-group position-relative">
                        <div className={`input-group ${isJudge && !isEditing ? 'blurred' : ''}`}>
                            <span className="input-group-text" id="basic-addon1">
                                <BsPerson />
                            </span>
                            <input 
                                type='text' 
                                id="player_name" 
                                className='form-control' 
                                placeholder='Player Name' 
                                required 
                                {...register("player_name", { value: data?.player_name })} 
                                disabled={inputDisabled} // Disable for players if the event is closed
                            />
                            {errors.player_name && (
                                <div className="alert alert-danger py-1 mt-1 mb-0 small">
                                    <span>{errors.player_name.message}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="form-group position-relative">
                        {isJudge && !isEditing && (
                            <button 
                                type="button" 
                                className="btn btn-primary edit-button-overlay" 
                                onClick={() => {
                                    setIsEditing(true);
                                }}
                            >
                                Edit Decklist
                            </button>
                        )}
                        <div className={`textarea-container ${isJudge && !isEditing ? 'blurred' : ''}`}>
                            <div className="form-group mb-1">
                                {!isJudge && (
                                    <div className="text-end">
                                        <a href={`/help/decklist#${props.event.decklist_style.toLowerCase()}`} target="_blank" rel="noopener noreferrer">
                                            See formatting guide
                                        </a>
                                    </div>
                                )}
                            </div>
                            <textarea 
                                id='decklist_text' 
                                className="form-control" 
                                placeholder={getDecklistPlaceholder(props.event.decklist_style)} 
                                required 
                                {...register("decklist_text", { value: data?.decklist_text })} 
                                style={{ width: '100%', height: 400 }} 
                                disabled={inputDisabled} // Disable for players if the event is closed
                            />
                            {errors.decklist_text && (
                                <div className="alert alert-danger py-1 mt-1 mb-0 small">
                                    <span>{errors.decklist_text.message}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div 
                        className="event-info mb-3 d-flex justify-content-between align-items-center position-relative" 
                        style={{ padding: '10px', marginTop: '5px', minHeight: '60px' }}
                    >
                        {showToast ? (
                            <div 
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'green',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    borderRadius: '4px',
                                    zIndex: 1
                                }}
                            >
                                Your deck has been submitted
                            </div>
                        ) : (
                            <>
                            <div className="d-flex">
                                {props.event.decklist_style.toLowerCase() === "commander" ? (
                                    <span className="no-wrap-text">Deck: {mainboardCount}</span>
                                ) : (
                                    <>
                                        <span style={{ marginRight: 10 }} className="no-wrap-text">Main: {mainboardCount}</span>
                                        <span className="no-wrap-text">Side: {sideboardCount}</span>
                                    </>
                                )}
                            </div>
                            {isDirty && (
                                <button 
                                    type='submit' 
                                    className='btn btn-primary no-wrap-text' 
                                    id='submit-button'
                                >
                                    {data ? 'Resubmit Decklist' : 'Submit Decklist'}
                                </button>
                            )}

                            </>
                        )}
                    </div>

                    {data?.deck_warnings && data.deck_warnings.length > 0 && (
                        <div className="mt-3">
                            <div className="alert alert-warning">
                                <h5 className="alert-heading">Deck Warnings</h5>
                                <ul className="mb-0">
                                    {data.deck_warnings.map((warning, index) => (
                                        <li key={index}>{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className='col-lg-8 col-sm-12 decklist-table-container' style={{ marginTop: '10px' }}>
                    {data && <DecklistTable decklistData={data} allowChecklist={isJudge} />}
                </div>
            </div>
        </form>
        </>
    )
}
