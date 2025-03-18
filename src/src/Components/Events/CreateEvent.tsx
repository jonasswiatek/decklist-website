import '../../App.scss'
import { useForm, SubmitHandler } from "react-hook-form";
import { HandleValidation } from '../../Util/Validators';
import { createEventRequest } from '../../model/api/apimodel';
import { useNavigate } from "react-router-dom";
import { ReactElement } from 'react';


export function CreateEvent() : ReactElement {
    const { register, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<Inputs>();
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<Inputs> = async data => {
      try {
        await createEventRequest({ event_name: data.event_name, format: data.format, event_date: data.event_date });
        navigate('/');
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
                                    >
                                        <option value="Modern">Modern</option>
                                        <option value="Pioneer">Pioneer</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Commander">Commander</option>
                                        <option value="Legacy">Legacy</option>
                                        <option value="Vintage">Vintage</option>
                                        <option value="Pauper">Pauper</option>
                                    </select>
                                    {errors.format && <div className="invalid-feedback">{errors.format?.message}</div>}
                                </div>
                                
                                <div className="d-grid mt-4">
                                    <button type='submit' className='btn btn-dark btn-lg'>Create Event</button>
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