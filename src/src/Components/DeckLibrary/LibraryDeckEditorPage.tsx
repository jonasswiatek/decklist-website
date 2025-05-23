import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { DecklistGroup, deleteLibraryDeckRequest, Format, NotFoundError, saveLibraryDeckRequest } from '../../model/api/apimodel';
import { BsPerson, BsArrowLeft, BsTrash, BsCardText } from 'react-icons/bs';
import { SubmitHandler, useForm } from 'react-hook-form';
import { getDecklistPlaceholder } from '../../Util/DecklistPlaceholders';
import { DecklistTable } from '../Events/DecklistTable';
import { LoadingScreen } from '../Login/LoadingScreen';
import { HandleValidation } from '../../Util/Validators';
import { useFormatsQuery } from '../../Hooks/useFormatsQuery';
import { useLibraryDeckQuery } from '../../Hooks/useLibraryDeckQuery';
import { useLibraryDecksQuery } from '../../Hooks/useLibraryDecksQuery';

export const LibraryDeckEditorPage: React.FC = () => {
  const { deck_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const importedDeck = location.state?.importedDeck;

  const { data, error, isLoading, refetch } = useLibraryDeckQuery(deck_id);
  const { refetch: refetchDeckLibrary } = useLibraryDecksQuery();
  const { data: formats, isLoading: formatsLoading, error: formatsError } = useFormatsQuery();

  if (isLoading || formatsLoading) {
      return <LoadingScreen />
  }
  
  if(error instanceof NotFoundError) {
    return (
    <div className="alert alert-warning" role="alert">
      <h4 className="alert-heading">Deck not found</h4>
      <hr />
      <p className="mb-0">No deck found.</p> 
    </div>
    );
  }

  if(error || formatsError) {
      return (
          <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error loading deck</h4>
              <hr />
              <p className="mb-0">Please try again later.</p> 
          </div>
      );
  }

  const handleDeckUpdate = async (deck_name: string, format: string, decklist_text: string) => {
    const result = await saveLibraryDeckRequest({
      deck_id: deck_id,
      deck_name: deck_name,
      format: format,
      decklist_text: decklist_text,
    });

    refetchDeckLibrary();
    if (deck_id) {
      refetch();
    }
    else {
      navigate('/library/deck/' + result.deck_id);
    }
  };

  const handleDeleteDeck = async () => {
    // Implement deck deletion logic here
    await deleteLibraryDeckRequest(deck_id!);
    refetchDeckLibrary();
    navigate('/library');
  };

  return (
    <>
      <div className="container">
        <div className="mb-3">
          <button 
            type="button" 
            className="btn btn-link text-decoration-none p-0" 
            onClick={() => navigate('/library')}
          >
            <BsArrowLeft className="me-1" /> Back to Library
          </button>
        </div>
        <LibraryDeckEditor 
          deck_name={data?.deck_name}
          format={data?.format ?? importedDeck?.format}
          formats={formats!.formats}
          groups={data?.groups}
          deck_warnings={data?.deck_warnings}
          decklist_text={data?.decklist_text ?? importedDeck?.decklist_text}
          onDeckUpdate={handleDeckUpdate}
          onDeleteDeck={handleDeleteDeck}
        />
      </div>
    </>
  );
}

type LibraryDeckEditorProps = {
  deck_name?: string;
  format?: string;
  formats: Format[];
  groups?: DecklistGroup[];
  deck_warnings?: string[];
  decklist_text?: string;
  onDeckUpdate: (deck_name: string, format: string, decklist_text: string) => void;
  onDeleteDeck: () => void;
}

const LibraryDeckEditor: React.FC<LibraryDeckEditorProps> = (props) => {
  interface Inputs {
    deck_name: string;
    format: string;
    decklist_text: string;
  }

  const [decklistStyle, setDecklistStyle] = useState<string | undefined>(undefined);

  const { register, handleSubmit, clearErrors, watch, setError, reset, formState: { errors, isDirty, isSubmitting } } = useForm<Inputs>({
    defaultValues: {
      deck_name: props.deck_name,
      format: props.format,
      decklist_text: props.decklist_text
    }
  });

  // Watch the format field to update the decklist style
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'format') {
        const style = props.formats.find(format => format.format === value.format)?.decklist_style;
        setDecklistStyle(style);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, props.formats]);

  useEffect(() => {
    if (props.format) {
      const style = props.formats.find(format => format.format === props.format)?.decklist_style;
      setDecklistStyle(style);
    }
  }, [props.format, props.formats]);

  const onSubmitDecklist: SubmitHandler<Inputs> = async data => {
    try {
      await props.onDeckUpdate(data.deck_name, data.format, data.decklist_text);
      reset(data);  
    }
    catch (e) {
      HandleValidation(setError, e);
    }
  }

  const handleDeleteDeck = async () => {
    if (window.confirm("Are you sure you want to delete this deck? This action cannot be undone.")) {
        props.onDeleteDeck();
    }
  };

  // Calculate mainboard and sideboard counts
  const mainboardCount = props.groups
    ? props.groups
        .filter(group => group.group_name !== "Sideboard")
        .flatMap(group => group.cards)
        .reduce((sum, card) => sum + card.quantity, 0)
    : 0;

  const sideboardCount = props.groups
    ? props.groups
        .find(group => group.group_name === "Sideboard")?.cards
        .reduce((sum, card) => sum + card.quantity, 0) || 0
    : 0;

  return (
  <form onSubmit={(e) => { clearErrors(); handleSubmit(onSubmitDecklist)(e); }} >
        <div className='row'>
            <div className='col-lg-4 col-sm-12'>
                <div className="form-group position-relative mb-1">
                    <div className="input-group">
                        <span className="input-group-text" id="basic-addon1">
                            <BsPerson />
                        </span>
                        <input 
                            type='text' 
                            id="deck_name" 
                            className='form-control' 
                            placeholder='Deck Name' 
                            required 
                            {...register("deck_name", { value: props.deck_name })} 
                        />
                        {(props.groups) && (
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={handleDeleteDeck}
                                title="Delete Deck"
                            >
                                <BsTrash />
                            </button>
                        )}
                    </div>
                    {errors.deck_name && (
                        <div className="alert alert-danger py-1 mt-1 mb-0 small">
                            <span>{errors.deck_name.message}</span>
                        </div>
                    )}
                </div>
                
                <div className="event-info mb-1">
                  <div className="format-container">
                    <div className="input-group">
                        <span className="input-group-text" id="format-addon">
                            <BsCardText />
                        </span>
                        <select 
                            id="format"
                            className={`form-select ${errors.format ? 'is-invalid' : ''}`} 
                            {...register("format")}
                        >
                            <option value="" defaultChecked>Select a format</option>
                            {props.formats.map(format => (
                                <option key={format.format} value={format.format}>{format.name}</option>
                            ))}
                        </select>
                        {errors.format && <div className="invalid-feedback">{errors.format?.message}</div>}
                    </div>
                  </div>
                </div>
                
                {decklistStyle && (<>
                  <div className="form-group position-relative">
                    <div className={`textarea-container}`}>
                      <div className="form-group mb-1">
                        <div className="text-end">
                            <a href={`/help/decklist#${decklistStyle.toLowerCase()}`} target="_blank" rel="noopener noreferrer">
                                See formatting guide
                            </a>
                        </div>
                      </div>
                      <textarea 
                          id='decklist_text' 
                          className="form-control" 
                          placeholder={getDecklistPlaceholder(decklistStyle)} 
                          required 
                          {...register("decklist_text", { value: props.decklist_text })} 
                          style={{ width: '100%', height: 400 }} 
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
                    <div className="d-flex">
                      {decklistStyle.toLowerCase() === "commander" ? (
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
                          disabled={isSubmitting} // Disable button while submitting
                      >
                          {isSubmitting ? (
                              <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Savings
                              </>
                          ) : (
                              'Save Decklist'
                          )}
                      </button>
                    )}
                  </div>
                </>)}

                {props.deck_warnings && props.deck_warnings.length > 0 && (
                    <div className="mt-3">
                        <div className="alert alert-warning">
                            <h5 className="alert-heading">Deck Warnings</h5>
                            <ul className="mb-0">
                                {props.deck_warnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
            
            <div className='col-lg-8 col-sm-12 decklist-table-container' style={{ marginTop: '10px' }}>
                {props.groups && <DecklistTable cardGroups={props.groups} allowChecklist={false} />}
            </div>
        </div>
    </form>
  );
}