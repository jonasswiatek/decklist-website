import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { BsPerson } from 'react-icons/bs';
import { DecklistResponse, submitDecklistRequest } from '../../../model/api/apimodel';
import { HandleValidation } from '../../../Util/Validators';
import { DecklistTable } from '../DecklistTable';
import { EventViewProps } from '../EventTypes';

export const JoinedPlayerView: React.FC<EventViewProps> = (e) => {
    type Inputs = {
        player_name: string,
        decklist_text: string
    };

    const { data, error, isLoading, refetch } = useQuery({
        queryKey: [`deck-${e.event.event_id}`],
        retry: false,
        refetchOnWindowFocus: false,
        queryFn: () =>
            fetch(`/api/events/${e.event.event_id}/deck`).then(async (res) => {
                if (res.status === 404) {
                    return null;
                }

                if (!res.ok) {
                    throw "error";
                }

                return await res.json() as DecklistResponse;
            }
        ),
    });

    const { register, setError, handleSubmit, clearErrors, reset, formState: { errors, isDirty } } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = async data => {
        try {
            await submitDecklistRequest({ event_id: e.event.event_id, player_name: data.player_name, decklist_text: data.decklist_text });
            refetch();
            reset(data);
        }
        catch(e) {
            console.log("handle val", e);
            HandleValidation(setError, e);
        }
    }

    if (isLoading) {
        return <p>Loading...</p>
    }

    if (error != null) {
        return <p>Error, try later</p>
    }

    const mainboardCount = data?.mainboard.reduce((acc, val) => acc + val.quantity, 0);
    const sideboardCount = data?.sideboard.reduce((acc, val) => acc + val.quantity, 0);

    return (
        <>
        <form onSubmit={(e) => { clearErrors(); handleSubmit(onSubmit)(e); }} >
            <div className='row'>
                <div className='col-md-4 col-sm-12'>
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
                            <textarea id='decklist_text' className="form-control" placeholder="3 Sheoldred, the Apocalypse" required {...register("decklist_text", { value: data?.decklist_text })} style={{ width: '100%', height: 400 }} />
                            {errors.decklist_text && <p>{errors.decklist_text?.message}</p>}
                        </div>
                    </div>
                </div>
                <div className='col-md-8 col-sm-12 decklist-table-container'>
                    <DecklistTable mainboard={data?.mainboard} sideboard={data?.sideboard} allowChecklist={false} />
                </div>
                <div className={getSubmitButtonClass(mainboardCount!, sideboardCount!)}>
                <div>
                        <span style={{margin: 5}}>Main: {mainboardCount}</span>
                        <span style={{margin: 5}}>Side: {sideboardCount}</span>
                    </div>
                    {isDirty ? <button type='submit' className='btn btn-primary' id='submit-button'>Save</button> : <></>}
                </div>
            </div>
        </form>
        </>
    )
}

function getSubmitButtonClass(mainDeckCount: number, sideboardCount: number) {
    if (mainDeckCount < 60 || sideboardCount > 15) {
      return "float-bottom submit-button-wrapper submit-button-warning";
    } else {
      return "float-bottom submit-button-wrapper submit-button-ok";
    }
  }
  