import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { DecklistResponse, deleteDeckRequest, EventDetails, getDecklistRequest, getEvent, submitDecklistRequest } from '../../model/api/apimodel';
import { DecklistTable } from './DecklistTable';
import { SubmitHandler, useForm } from 'react-hook-form';
import { HandleValidation } from '../../Util/Validators';
import { BsPerson } from 'react-icons/bs';

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
    
    return (<DeckEditor event={data!} user_id={id} />)
}

type DeckEditorProps = {
    event: EventDetails,
    user_id: string | null,
}

export const DeckEditor: React.FC<DeckEditorProps> = (props) => {
    const isJudge = props.user_id != null;
    const [showJudgeEditForm, setShowJudgeEditForm] = useState(false);
    const navigate = useNavigate();

    const { data, error, isLoading, refetch } = useQuery<DecklistResponse>({
        queryKey: [`deck-${props.event.event_id}-${props.user_id}`],
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () => getDecklistRequest(props.event.event_id, props.user_id),
    });

    const isOpen = props.event.status === "open";

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

    const mainboardCount = data?.mainboard.reduce((acc, val) => acc + val.quantity, 0) ?? 0;
    const sideboardCount = data?.sideboard.reduce((acc, val) => acc + val.quantity, 0) ?? 0;
    
    // Check if the deck is valid:
    // 1. deck_warnings should be empty
    // 2. No card in mainboard or sideboard should have warnings
    const isValid = (
        (!data?.deck_warnings || data.deck_warnings.length === 0) &&
        (!data?.mainboard || !data.mainboard.some(card => card.warnings && card.warnings.length > 0)) &&
        (!data?.sideboard || !data.sideboard.some(card => card.warnings && card.warnings.length > 0))
    );

    return (
        <>
        <form onSubmit={(e) => { clearErrors(); handleSubmit(onSubmit)(e); }} >
            <div className='row'>
                {isJudge && (
                    <div className='col-12 mb-3'>
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={handleBackToEvent}
                        >
                            Back to Event
                        </button>
                    </div>
                )}
                {(!isJudge || showJudgeEditForm) && (
                    <div className='col-md-4 col-sm-12'>
                        <div className="event-info mb-3 d-flex justify-content-between align-items-center">
                            <p className="mb-0"><strong>Format:</strong> {props.event.format}</p>
                            {isOpen && data && !isJudge && (
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
                        
                        <>
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="input-group-text" id="basic-addon1">
                                        <BsPerson />
                                    </span>
                                    <input type='text' id="player_name" className='form-control' placeholder='Player Name' required {...register("player_name", { value: data?.player_name })} />
                                </div>
                            </div>
                            <hr></hr>
                            <div className="form-group">
                                <div>
                                    {isOpen ? (
                                        <>
                                            <textarea id='decklist_text' className="form-control" placeholder="3 Sheoldred, the Apocalypse" required {...register("decklist_text", { value: data?.decklist_text })} style={{ width: '100%', height: 400 }} />
                                            {errors.decklist_text && <p>{errors.decklist_text?.message}</p>}
                                        </>
                                    ) : (
                                        <div className="decklist-readonly">
                                            <pre className="form-control" style={{ width: '100%', height: 400, whiteSpace: 'pre-wrap', overflowY: 'auto' }}>
                                                {data?.decklist_text || 'No decklist submitted'}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                        
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
                <div className={(!isJudge || showJudgeEditForm) ? 'col-md-8 col-sm-12 decklist-table-container' : 'col-12 decklist-table-container'}>
                  
                    <DecklistTable mainboard={data?.mainboard} sideboard={data?.sideboard} allowChecklist={isJudge} />
                </div>
                
                {isOpen && (
                    <div className={`float-bottom submit-button-wrapper ${getSubmitButtonWrapperClass(isValid)}`}>
                        <div>
                            {isDirty && (<span>You have unsaved changes</span>)}
                            {!isDirty && (
                                <div>
                                    <span style={{margin: 5}}>Main: {mainboardCount}</span>
                                    <span style={{margin: 5}}>Side: {sideboardCount}</span>
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
                        {isDirty ? <button type='submit' className='btn btn-primary' id='submit-button'>Save</button> : <></>}
                    </div>
                )}
            </div>
        </form>
        </>
    )
}
