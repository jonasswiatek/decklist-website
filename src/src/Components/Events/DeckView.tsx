import React, { useState, useRef } from 'react';
import { useQuery } from 'react-query';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { DecklistResponse, deleteDeckRequest, EventDetails, getDecklistRequest, getEvent, submitDecklistRequest } from '../../model/api/apimodel';
import { DecklistTable } from './DecklistTable';
import { SubmitHandler, useForm } from 'react-hook-form';
import { HandleValidation } from '../../Util/Validators';
import { BsPerson, BsCheckCircle } from 'react-icons/bs';
import { getDecklistPlaceholder } from '../../Util/DecklistPlaceholders';

export function DeckView() {
    const { event_id } = useParams();
    const [ searchParams ] = useSearchParams();
    const id = searchParams.get('id');
    const showEditor = searchParams.get('showEditor');

    const { data, error, isLoading } = useQuery<EventDetails>({
        queryKey: [`event-${event_id}`],
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () => getEvent(event_id!)
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
    
    return (<DeckEditor event={data!} user_id={id} showEditor={showEditor === 'true'} />)
}

type DeckEditorProps = {
    event: EventDetails,
    user_id: string | null,
    showEditor: boolean | null
}

export const DeckEditor: React.FC<DeckEditorProps> = (props) => {
    const isJudge = props.user_id != null;
    const isOpen = props.event.status === "open" || isJudge;

    const [showJudgeEditForm, setShowJudgeEditForm] = useState(props.showEditor);
    const [showToast, setShowToast] = useState(false);
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
    const onSubmit: SubmitHandler<Inputs> = async data => {
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

    const getSubmitButtonWrapperClass = (isValid: boolean): string => {
        return isValid ? "submit-button-ok" : "submit-button-warning";
    };

    if (isLoading) {
        return <p>Loading...</p>
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

    // Check if the deck is valid:
    // 1. deck_warnings should be empty
    // 2. No card in any group should have warnings
    const isValid = (
        (!data?.deck_warnings || data.deck_warnings.length === 0) &&
        (!data?.groups || !data.groups.some(group => 
            group.cards.some(card => card.warnings && card.warnings.length > 0)
        ))
    );

    return (
        <>
        <form onSubmit={(e) => { clearErrors(); handleSubmit(onSubmit)(e); }} >
            <div className='row'>
                {isJudge && (
                    <>
                        <div className='col-12 mb-3'>
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={handleBackToEvent}
                            >
                                Back to Event
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
                    </>
                )}
                {(!isJudge || showJudgeEditForm) && (
                    <div className='col-md-4 col-sm-12'>
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
                        
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-text" id="basic-addon1">
                                    <BsPerson />
                                </span>
                                <input type='text' id="player_name" className='form-control' placeholder='Player Name' required {...register("player_name", { value: data?.player_name })} />
                                {errors.player_name && (
                                    <div className="alert alert-danger py-1 mt-1 mb-0 small">
                                        <span>{errors.player_name.message}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="form-group">
                            <div>
                                {isOpen ? (
                                    <>
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
                                        />
                                        {errors.decklist_text && (
                                            <div className="alert alert-danger py-1 mt-1 mb-0 small">
                                                <span>{errors.decklist_text.message}</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="decklist-readonly">
                                        <pre className="form-control" style={{ marginTop: '10px', width: '100%', height: 400, whiteSpace: 'pre-wrap', overflowY: 'auto' }}>
                                            {data?.decklist_text || 'No decklist submitted'}
                                        </pre>
                                    </div>
                                )}
                            </div>
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
                )}
                
                {/* Always display the decklist table, but adjust width based on edit mode */}
                <div className={(!isJudge || showJudgeEditForm) ? 'col-md-8 col-sm-12 decklist-table-container' : 'col-12 decklist-table-container'} style={{ marginTop: '10px' }}>
                    {data && <DecklistTable decklistData={data} allowChecklist={isJudge} />}
                </div>
                
                {isOpen && (
                    <div className={`float-bottom submit-button-wrapper ${getSubmitButtonWrapperClass(isValid)}`}>
                        <div>
                            {isDirty && (<span className="no-wrap-text">You have unsaved changes</span>)}
                            {!isDirty && (
                                <div style={{ display: 'flex', minWidth: 0, flexShrink: 1 }}>
                                    <span style={{margin: 5}} className="no-wrap-text">Main: {mainboardCount}</span>
                                    <span style={{margin: 5}} className="no-wrap-text">Side: {sideboardCount}</span>
                                </div>
                            )}
                        </div>
                        {/* Show Edit Decklist button for judges when not in edit mode */}
                        {isJudge && !showJudgeEditForm && (
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={() => setShowJudgeEditForm(true)}
                            >
                                Edit Decklist
                            </button>
                        )}
                        {/* Show Save button when form is dirty */}
                        {isDirty ? <button type='submit' className='btn btn-primary no-wrap-text' id='submit-button'>{data ? 'Resubmit Decklist' : 'Submit Decklist'}</button> : <></>}
                    </div>
                )}
            </div>
        </form>
        
        {/* Toast notification */}
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
            <div 
                className={`toast ${showToast ? 'show' : 'hide'}`} 
                role="alert" 
                aria-live="assertive" 
                aria-atomic="true"
                style={{ 
                    display: showToast ? 'block' : 'none',
                    minWidth: '250px'
                }}
            >
                <div className="toast-header bg-success text-white">
                    <BsCheckCircle className="me-2" />
                    <strong className="me-auto">Success</strong>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowToast(false)} aria-label="Close"></button>
                </div>
                <div className="toast-body bg-white text-dark">
                    Your decklist has been submitted.
                </div>
            </div>
        </div>
        </>
    )
}
