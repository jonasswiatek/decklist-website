import { useParams, useSearchParams } from 'react-router-dom';

export function DeckView() {
    const { event_id } = useParams();
    const [ searchParams ] = useSearchParams();

    const id = searchParams.get('id');
    if (!id || !event_id)
        return (<p>not found</p>);

    return (<DeckList event_id={event_id} user_id={id} />)
}

type DeckListProps = {
    event_id: string,
    user_id: string,
}

const DeckList: React.FC<DeckListProps> = () => {
    return null;
}