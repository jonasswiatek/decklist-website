
import { useParams } from 'react-router-dom';
import { EventDetails } from '../../model/api/apimodel';
import { useEffect, useState } from 'react';

export function EventView() {
    const { event_id } = useParams();
    const [event, setEvent] = useState<EventDetails | null>(null);

    useEffect(() => {
        fetch("/api/events/" + event_id)
        .then((res) => res.json())
        .then((json) => json as EventDetails)
        .then((eventDetails) => setEvent(eventDetails));
    }, [event_id]);

    if (!event)
        return;
    
    return (
        <p>{event.event_name}</p>
    )
}