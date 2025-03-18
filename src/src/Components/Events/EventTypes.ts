import { EventDetails } from '../../model/api/apimodel';

export type EventViewProps = {
    event: EventDetails;
    refetch?: () => void;
}
