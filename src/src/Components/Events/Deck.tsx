import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../Login/AuthContext';

export function DeckView() {
    const { event_id } = useParams();
    const [ searchParams ] = useSearchParams();

    const id = searchParams.get('id');

    return (<p>{event_id}, {id}</p>)
}