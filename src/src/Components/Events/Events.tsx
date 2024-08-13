import '../../App.scss'
import { useForm, SubmitHandler } from "react-hook-form";
import { useDecklistStore } from '../../store/deckliststore';
import { HandleValidation } from '../../Util/Validators';
import { Link } from "react-router-dom";

export function EventList() {
  const { loadEvents, events, createEvent } = useDecklistStore();
  const { register, handleSubmit, setError, clearErrors, reset, formState: { errors } } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async data => {
    try {
      await createEvent(data.event_name, data.format, data.event_date);
      await loadEvents();
      reset();
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

  const listItems = events.map(event =>
    <li>
      <b><Link to={event.event_id}>{event.event_name}</Link></b><br />
      Format: {event.format}<br />
      Event Role: {event.role}<br />
      Event Date: {event.event_date.toString()}<br />
    </li>
  );
    
  return (
    <div className="py-3 py-md-5">
        <div className='container'>
            <div className='row'>
                <div className='col'>
                    <form onSubmit={(e) => { clearErrors(); handleSubmit(onSubmit)(e); }} > 
                        <label htmlFor="event_name" className="form-label">Event name</label>
                        <input id='event_name' type="text" className="form-control" placeholder="Modern RCQ" required {...register("event_name")} />
                        <input type='date' className='form-control' required {...register("event_date")} />
                        <select {...register("format")}>
                            <option value="Modern">modern</option>
                            <option value="Pioneer">pioneer</option>
                            <option value="Standard">standard</option>
                            <option value="Commander">commander</option>
                            <option value="legacy">legacy</option>
                            <option value="Vintage">vintage</option>
                            <option value="Pauper">pauper</option>
                        </select>
                        {errors.event_name && <p>{errors.event_name?.message}</p>}
                        {errors.format && <p>{errors.format?.message}</p>}
                        <button type='submit' className='btn btn-primary'>Create event</button>
                    </form>
                </div>
            </div>
            <div className='row'>
                <div className='col'>
                    <p>Events managed by you</p>
                    <ul>
                        {listItems}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  )
}