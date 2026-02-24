import '../../App.scss'
import { useForm } from "react-hook-form";
import { HandleValidation } from '../../Util/Validators';
import { useNavigate } from "react-router-dom";
import { ReactElement } from 'react';
import { BsArrowLeft } from 'react-icons/bs';
import { useFormatsQuery } from '../../Hooks/useFormatsQuery';
import { useCreateEventMutation } from '../../Hooks/useEventMutations';


export function CreateEvent() : ReactElement {
    const { register, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<Inputs>();
    const navigate = useNavigate();

    const { data: formats, isLoading: formatsLoading, error: formatsError } = useFormatsQuery();

    const mutation = useCreateEventMutation({
        onSuccess: (data) => {
            navigate('/e/' + data.event_id);
        },
        onError: (e) => HandleValidation(setError, e),
    });

    const onSubmit = (data: Inputs) => {
      clearErrors();
      mutation.mutate({
        body: {
          event_name: data.event_name.trim(),
          format: data.format,
          event_date: data.event_date.toString(),
        },
      });
    };

    type Inputs = {
      event_name: string,
      format: string
      event_date: Date;
    };

    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 1);
    const minDateString = minDate.toISOString().split('T')[0];

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 90);
    const maxDateString = maxDate.toISOString().split('T')[0];

    return (
      <div className="container mt-4">
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0"
            onClick={() => navigate('/')}
          >
            <BsArrowLeft className="me-1" /> Back to Events
          </button>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Create New Tournament</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)} >
                  <div className="mb-3">
                    <label htmlFor="event_name" className="form-label">Tournament Name</label>
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
                    <label htmlFor="event_date" className="form-label">Tournament Date</label>
                    <input
                      id="event_date"
                      type='date'
                      className={`form-control ${errors.event_date ? 'is-invalid' : ''}`}
                      required
                      {...register("event_date")}
                      min={minDateString}
                      max={maxDateString}
                    />
                    {errors.event_date && <div className="invalid-feedback">{errors.event_date?.message}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="format" className="form-label">Format</label>
                    {formatsLoading ? (
                      <div className="p-2 border rounded text-center">
                        <small className="text-muted">Loading formats...</small>
                      </div>
                    ) : formatsError ? (
                      <div className="alert alert-danger py-2" role="alert">
                        <small>Error loading formats. Please refresh the page.</small>
                      </div>
                    ) : (
                      <select
                        id="format"
                        className={`form-select ${errors.format ? 'is-invalid' : ''}`}
                        {...register("format")}
                      >
                        {formats?.formats.map(format => (
                          <option key={format.format} value={format.format}>{format.name}</option>
                        ))}
                      </select>
                    )}
                    {errors.format && <div className="invalid-feedback">{errors.format?.message}</div>}
                  </div>

                  <div className="d-grid mt-4">
                    <button
                      type='submit'
                      className='btn btn-primary'
                      disabled={mutation.isPending || formatsLoading || !!formatsError}
                    >
                      {mutation.isPending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating...
                        </>
                      ) : 'Create Tournament'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
