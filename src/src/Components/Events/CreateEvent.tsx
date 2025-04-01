import '../../App.scss'
import { useForm, SubmitHandler } from "react-hook-form";
import { HandleValidation } from '../../Util/Validators';
import { createEventRequest, getFormatsRequest, FormatResponse } from '../../model/api/apimodel';
import { useNavigate } from "react-router-dom";
import { ReactElement } from 'react';
import { useQuery } from 'react-query';


export function CreateEvent() : ReactElement {
    const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<Inputs>();
    const navigate = useNavigate();

    const { data: formats, isLoading: formatsLoading, error: formatsError } = useQuery<FormatResponse>(
        'formats', 
        getFormatsRequest
    );
    
    const onSubmit: SubmitHandler<Inputs> = async data => {
      try {
        const createdEvent = await createEventRequest({ event_name: data.event_name, format: data.format, event_date: data.event_date });
        navigate('/e/' + createdEvent.event_id);
      }
      catch(e) {
        HandleValidation(setError, e);
      }
    }
  
    type Inputs = {
      event_name: string,
      format: string
      event_date: Date;
    };
        
    return (
      <>
        <div className='container mt-4'>
            <div className='row justify-content-center'>
                <div className='col-md-8 col-lg-6'>
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header py-3 bg-dark text-white">
                            <h5 className="mb-0 fw-bold">Create New Event</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={(e) => { clearErrors(); handleSubmit(onSubmit)(e); }} > 
                                <div className="mb-3">
                                    <label htmlFor="event_name" className="form-label fw-bold">Event Name</label>
                                    <input 
                                        id='event_name' 
                                        type="text" 
                                        className={`form-control ${errors.event_name ? 'is-invalid' : ''}`} 
                                        placeholder="Modern RCQ" 
                                        required 
                                        {...register("event_name")} 
                                    />
                                    {errors.event_name && <div className="invalid-feedback">{errors.event_name?.message}</div>}
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="event_date" className="form-label fw-bold">Event Date</label>
                                    <input 
                                        id="event_date"
                                        type='date' 
                                        className={`form-control ${errors.event_date ? 'is-invalid' : ''}`} 
                                        required 
                                        {...register("event_date")} 
                                    />
                                    {errors.event_date && <div className="invalid-feedback">{errors.event_date?.message}</div>}
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="format" className="form-label fw-bold">Format</label>
                                    <select 
                                        id="format"
                                        className={`form-select ${errors.format ? 'is-invalid' : ''}`} 
                                        {...register("format")}
                                        disabled={formatsLoading}
                                    >
                                        {formatsLoading ? (
                                            <option>Loading formats...</option>
                                        ) : formatsError ? (
                                            <option>Error loading formats</option>
                                        ) : formats?.formats.map(format => (
                                            <option key={format.format} value={format.format}>{format.name}</option>
                                        ))}
                                    </select>
                                    {errors.format && <div className="invalid-feedback">{errors.format?.message}</div>}
                                </div>
                                
                                <div className="d-grid mt-4">
                                    <button 
                                        type='submit' 
                                        className='btn btn-dark btn-lg'
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Creating...
                                            </>
                                        ) : 'Create Event'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </>
    )
  }