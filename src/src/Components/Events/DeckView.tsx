import React, { useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { EventDetails, getDecklistRequest, getLibraryDeckRequest } from '../../model/api/apimodel';
import { DecklistTable } from './DecklistTable';
import { useForm } from 'react-hook-form';
import { HandleValidation } from '../../Util/Validators';
import { BsArrowLeft, BsPerson, BsTrash, BsCardText, BsPrinter, BsClockHistory } from 'react-icons/bs';
import { getDecklistPlaceholder } from '../../Util/DecklistPlaceholders';
import { LoadingScreen } from '../Login/LoadingScreen';
import { useEventDetailsQuery } from '../../Hooks/useEventDetailsQuery';
import { useEventListQuery } from '../../Hooks/useEventListQuery';
import { useLibraryDecksQuery } from '../../Hooks/useLibraryDecksQuery';
import { useDecklistQuery } from '../../Hooks/useDecklistQuery';
import { useDecklistRevisionsQuery } from '../../Hooks/useDecklistRevisionsQuery';
import { useSubmitDeckMutation, useDeleteDeckMutation, useSetDeckCheckedMutation } from '../../Hooks/useDeckMutations';

export function DeckView() {
    const { event_id } = useParams();
    const [ searchParams ] = useSearchParams();
    const id = searchParams.get('id');

    const { data, error, isLoading } = useEventDetailsQuery(event_id!);
    
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
    user_id?: string | null,
}

export const DeckEditor: React.FC<DeckEditorProps> = (props) => {
    const isJudge = props.user_id != null;
    const isPlayer = !isJudge;
    const isOpen = props.event.status === "open" || isJudge;

    const [showToast, setShowToast] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // New state to track if the judge is editing
    const [showRevisionsTable, setShowRevisionsTable] = useState(false); // State for revisions table visibility
    const [showRevisionId, setShowRevisionId] = useState<number | null>(null); // State for selected revision ID

    const navigate = useNavigate();
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { refetch: refetchEvent } = useEventDetailsQuery(props.event.event_id, false);
    const { data: decklistData, error: decklistError, isLoading: decklistLoading, refetch: refetchDecklist } = useDecklistQuery(props.event.event_id, props.user_id);
    const { data: revisions, isLoading: revisionsLoading, refetch: refetchRevisions } = useDecklistRevisionsQuery(props.event.event_id, props.user_id, false);
    const { data: library, error: libraryError, isLoading: libraryLoading } = useLibraryDecksQuery(isPlayer);
    const { data: events, isLoading: eventsLoading, refetch: refetchMyEvents } = useEventListQuery(isPlayer);

    type Inputs = {
        user_id?: string,
        player_name: string,
        deck_name?: string,
        decklist_text: string
    };
 
    const { register, setError, handleSubmit, clearErrors, reset, setValue, formState: { errors, isDirty } } = useForm<Inputs>();
    const submitMutation = useSubmitDeckMutation({
        onSuccess: () => {
            refetchDecklist();

            if (isPlayer) {
                refetchMyEvents();
            }
            else {
                refetchEvent();
            }

            reset(lastSubmittedData.current ?? undefined);

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
        },
        onError: (e) => HandleValidation(setError, e),
    });
    const lastSubmittedData = useRef<Inputs | null>(null);
    const onSubmitDecklist = (data: Inputs) => {
        clearErrors();
        lastSubmittedData.current = data;
        submitMutation.mutate({
            params: { path: { event_id: props.event.event_id } },
            body: {
                user_id: props.user_id,
                player_name: data.player_name.trim(),
                deck_name: data.deck_name?.trim(),
                decklist_text: data.decklist_text,
            },
        });
    };

    const deleteDeckMutation = useDeleteDeckMutation({
        onSuccess: () => {
            refetchDecklist();
            if (isPlayer) {
                refetchMyEvents();
            }
            reset({ player_name: '', deck_name: '', decklist_text: '' });
        },
    });

    const handleDeleteDeck = () => {
        if (window.confirm("Are you sure you want to delete this deck? This action cannot be undone.")) {
            deleteDeckMutation.mutate({
                params: { path: { event_id: props.event.event_id } },
            });
        }
    };

    const handleImportDeck = async (selectedDeck: string) => {
        if (selectedDeck === 'none') {
            setValue("decklist_text", '', { 
                shouldDirty: true,
                shouldValidate: true
            });
            return;
        }
        const [source, id] = selectedDeck.split(':');
        switch (source) {
            case 'saved': {
                const savedDeck = await getLibraryDeckRequest({ deck_id: id });
                setValue("deck_name", savedDeck.deck_name, { 
                    shouldDirty: true,
                    shouldValidate: true
                });

                setValue("decklist_text", savedDeck.decklist_text, { 
                    shouldDirty: true,
                    shouldValidate: true
                });
                break;
            }

            case 'event': {
                const decklist = await getDecklistRequest(id);
                if (!decklist) break;
                setValue("deck_name", decklist.deck_name ?? '', {
                    shouldDirty: true,
                    shouldValidate: true
                });

                setValue("decklist_text", decklist.decklist_text, {
                    shouldDirty: true,
                    shouldValidate: true
                });
                break;
            }
        }
    };

    const handleBackToEvent = () => {
        navigate(`/e/${props.event.event_id}`);
    };

    const handleShowRevisions = () => {
        const newShowState = !showRevisionsTable;
        if (newShowState && !revisions) {
            refetchRevisions();
        }
        else {
            setShowRevisionId(null);
        }
        
        setShowRevisionsTable(newShowState);
    };

    const handleSelectRevision = (revisionId: number) => {
        console.log("Selected revision:", revisionId);
        setShowRevisionId(revisionId);
    };

    const handleDeckChecked = () => {
        refetchDecklist();
        refetchEvent();
    }

    if (decklistLoading || libraryLoading || eventsLoading) {
        return <LoadingScreen />
    }

    if (decklistError || libraryError) {
        return <p>Error, try later</p>
    }

    const selectedRevision = revisions?.revisions.find(revision => revision.revision_id === showRevisionId);
    const data = selectedRevision?.decklist ?? decklistData;
    const isViewingPreviousRevision = !(selectedRevision?.is_current ?? true);

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

    const hasSubmission = !!data;
    const inputDisabled = (isJudge && !isEditing) || !isOpen;
    const availableSavedDecks = library?.decks.filter(deck => deck.format === props.event.format) ?? [];
    const pastEvents = events?.filter(
        event => event.role === "player" &&
        event.format === props.event.format &&
        event.event_id != props.event.event_id) ?? [];

    return (
        <>
        <div className="container">
        {isJudge && (
            <div className='row'>
                <div className='col-12 mb-3 d-flex justify-content-between align-items-center'>
                    <button 
                        type="button" 
                        className="btn btn-link text-decoration-none p-0" 
                        onClick={handleBackToEvent}
                    >
                        <BsArrowLeft className="me-1" /> Back
                    </button>
                    {!showRevisionsTable && (
                        <FlagCheckedButton 
                            eventId={props.event.event_id} 
                            userId={props.user_id!} 
                            isChecked={data?.is_deck_checked || false} 
                            refetch={handleDeckChecked} 
                        />
                    )}
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
                    {!showRevisionsTable && (
                        <>
                            {!isOpen && !hasSubmission && (
                                <div className="alert alert-info mb-3">This tournament is past it's decklist submission deadline.</div>
                            )}
                            {!isOpen && hasSubmission && (
                                <div className="alert alert-info mb-3"><b>Your decklist is submitted</b>, but can no longer be modified because the submission deadline has passed.</div>
                            )}
                            {!isJudge && isOpen && hasSubmission && (
                                <div className="alert alert-success mb-3"><b>Your decklist is submitted</b>, and can be modified until the submission deadline.</div>
                            )}
                        </>
                    )}
                        <div className="event-info mb-3 d-flex justify-content-between align-items-center">
                            <p className="mb-0"><strong>Format:</strong> {props.event.format_name}</p>
                            <div className="d-flex">
                                {data && (
                                    <>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary me-2"
                                        title={showRevisionsTable ? "Hide Revisions" : "Show Revisions"}
                                        onClick={handleShowRevisions}
                                        disabled={revisionsLoading}
                                    >
                                        {revisionsLoading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            <BsClockHistory />
                                        )}
                                    </button>
                                    <Link 
                                        to={`/e/${props.event.event_id}/deck/print${props.user_id ? `?id=${props.user_id}` : ''}`}
                                        className="btn btn-sm btn-outline-secondary"
                                        title="Print Decklist"
                                        target="_blank" // Add this to open in a new window
                                        rel="noopener noreferrer" // Add this for security best practices
                                    >
                                        <BsPrinter className="me-1" /> Print
                                    </Link>
                                    </>
                                )}
                            </div>
                        </div>
                        {showRevisionsTable && revisions && revisions.revisions.length > 0 && (
                            <div className='col-12 mb-3'>
                                <table className="table table-sm table-hover" style={{ fontSize: '0.8rem' }}>
                                    <thead>
                                        <tr>
                                            <th>Revision</th>
                                            <th>By</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {revisions.revisions.map((revision) => (
                                            <tr 
                                                key={revision.revision_id} 
                                                onClick={() => handleSelectRevision(revision.revision_id)} 
                                                className={revision.revision_id === showRevisionId ? 'table-success' : ''}
                                                style={{ 
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <td>{new Date(revision.created_at).toLocaleString()} {revision.is_current ? "- latest" : ""}</td>
                                                <td>{revision.revised_by}</td>
                                                <td>{revision.revision_type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="small text-muted mb-0">Only the last 20 revisions are shown.</p>
                            </div>
                        )}
                        {showRevisionsTable && revisions && revisions.revisions.length === 0 && (
                            <div className='col-12 mb-3'>
                                <p className="text-muted">No revisions found for this decklist.</p>
                            </div>
                        )}
                    {!showRevisionsTable && (<>
                        <div className="form-group position-relative">
                            <div className={`input-group ${isJudge && !isEditing ? 'blurred' : ''}`}>
                                <span className="input-group-text" id="basic-addon1">
                                    <BsPerson />
                                </span>
                                <input 
                                    type='text' 
                                    id="player_name" 
                                    className='form-control' 
                                    placeholder='Your Name' 
                                    required 
                                    {...register("player_name", { value: data?.player_name ?? '' })}
                                    disabled={inputDisabled} // Disable for players if the event is closed
                                />
                                {data && !isJudge && isOpen && (
                                    <button 
                                        type="button" 
                                        className="btn btn-danger" 
                                        onClick={handleDeleteDeck}
                                    >
                                        <BsTrash />
                                    </button>
                                )}
                                {errors.player_name && (
                                    <div className="alert alert-danger py-1 mt-1 mb-0 small">
                                        <span>{errors.player_name.message}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="form-group position-relative mt-2">
                            <div className={`input-group ${isJudge && !isEditing ? 'blurred' : ''}`}>
                                <span className="input-group-text" id="basic-addon2">
                                    <BsCardText />
                                </span>
                                <input 
                                    type='text' 
                                    id="deck_name" 
                                    className='form-control' 
                                    placeholder='Deck Name (Optional)' 
                                    {...register("deck_name", { value: data?.deck_name ?? '' })}
                                    disabled={inputDisabled}
                                />
                                {errors.deck_name && (
                                    <div className="alert alert-danger py-1 mt-1 mb-0 small">
                                        <span>{errors.deck_name.message}</span>
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

                                {!isJudge && (
                                    <div className="mb-1">
                                        <select 
                                            className="form-select" 
                                            onChange={(e) => {
                                                const selectedDeckId = e.target.value;
                                                if (selectedDeckId) {
                                                    handleImportDeck(selectedDeckId);
                                                }
                                            }}
                                            disabled={(availableSavedDecks.length === 0 && pastEvents.length === 0) || inputDisabled}
                                        >
                                            <option key="none" value="none">
                                                {availableSavedDecks.length === 0 && pastEvents.length === 0
                                                    ? "No saved decks for this format" 
                                                    : "Import from..."}
                                            </option>
                                            {availableSavedDecks.length > 0 && (
                                                <optgroup label="My Decks">
                                                    {availableSavedDecks.map(deck => (
                                                        <option key={`saved-${deck.deck_id}`} value={`saved:${deck.deck_id}`}>
                                                            {deck.deck_name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            )}
                                            {pastEvents && pastEvents.length > 0 && (
                                                <optgroup label="Other Events">
                                                    {pastEvents.map(event => (
                                                        <option key={`event-${event.event_id}`} value={`event:${event.event_id}`}>
                                                            {event.event_name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            )}
                                        </select>
                                    </div>
                                )}

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
                                        disabled={submitMutation.isPending} // Disable button while submitting
                                    >
                                        {submitMutation.isPending ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Submitting
                                            </>
                                        ) : (
                                            data ? 'Resubmit Decklist' : 'Submit Decklist'
                                        )}
                                    </button>
                                )}

                                </>
                            )}
                        </div>
                    </>)}

                    {showRevisionsTable && isViewingPreviousRevision && (
                        <>
                            <div className="alert alert-warning mb-3">You're viewing a previous version of this decklist.</div>
                        </>
                    )}

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
                    {data && <DecklistTable cardGroups={data.groups} allowChecklist={isJudge} />}
                </div>
            </div>
        </form>
        </div>
        </>
    )
}

const FlagCheckedButton: React.FC<{ eventId: string, userId: string, isChecked: boolean, refetch: () => void }> = ({ eventId, userId, isChecked, refetch }) => {
    const [localCheckedState, setLocalCheckedState] = useState(isChecked);

    const setCheckedMutation = useSetDeckCheckedMutation({
        onSuccess: () => refetch(),
    });

    const onSubmit = () => {
        const newCheckedState = !localCheckedState;
        setLocalCheckedState(newCheckedState);
        setCheckedMutation.mutate({
            params: { path: { event_id: eventId } },
            body: { user_id: userId, is_checked: newCheckedState },
        });
    };

    return (
        <button
            type="button"
            onClick={onSubmit}
            className={`btn ${setCheckedMutation.isPending ? 'btn-secondary' : (localCheckedState ? 'btn-warning' : 'btn-success')}`}
            disabled={setCheckedMutation.isPending}
        >
            {localCheckedState ? 'Mark as Unchecked' : 'Mark as Checked'}
        </button>
    );
};