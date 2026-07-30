import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { JudgeView } from './Views/JudgeView';
import { DeckEditor } from './DeckView';
import { EventViewProps } from './EventTypes';
import { LoadingScreen } from '../Login/LoadingScreen';
import { useEventDetailsQuery } from '../../Hooks/useEventDetailsQuery';
import { useAuthQuery } from '../../Hooks/useAuthQuery';
import { PageContainer } from '@/Components/layout/PageContainer';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Card, CardContent } from '@/Components/ui/card';

const EventHeader: React.FC<{ eventName: string, eventId: string, role?: string | null }> = ({ eventName, eventId, role }) => {
    const showEventId = role === "owner" || role === "judge";
    const navigate = useNavigate();

    return (
        <PageContainer size="lg" className="pb-0">
            <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground" onClick={() => navigate('/')}>
                <ArrowLeft className="size-4" /> Events
            </Button>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{eventName}</h1>
                {showEventId && (
                    <Badge variant="secondary" className="select-all font-mono text-sm">
                        {eventId.toUpperCase()}
                    </Badge>
                )}
            </div>
        </PageContainer>
    );
};

const EventFullMessage: React.FC = () => {
    return (
        <PageContainer size="sm">
            <Alert variant="warning">
                <AlertTitle>Event is full</AlertTitle>
                <AlertDescription>
                    This event has reached its maximum player capacity. Please contact the Tournament Organizer if you believe you should still be able to register.
                </AlertDescription>
            </Alert>
        </PageContainer>
    );
};

export function EventView() {
    const { event_id } = useParams();
    const { authorized } = useAuthQuery();

    const { data, isError, isLoading, refetch } = useEventDetailsQuery(event_id!);

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    }

    if (isError) {
        return (
            <PageContainer>
                <p className="text-muted-foreground">Error. Try again later.</p>
            </PageContainer>
        )
    }

    if (!data) {
        return (
            <PageContainer>
                <p className="text-muted-foreground">Can't find this event. Check that the code you entered is correct.</p>
            </PageContainer>
        )
    }

    if (data.role === "owner" || data.role === "judge") {
        //Being viewed by a judge.
        return (
            <>
                <EventHeader eventName={data.event_name} eventId={data.event_id} role={data.role} />
                <JudgeView event={data} refetch={refetch} />
            </>
        )
    }

    return (
        <>
            <EventHeader eventName={data.event_name} eventId={data.event_id} role={data.role} />
            {(data.player_count >= data.max_players) ?
                <EventFullMessage /> :
                (authorized ? <DeckEditor event={data} /> : <UnauthedView event={data} />)
            }
        </>
    )
}


const UnauthedView: React.FC<EventViewProps> = (props) => {
    const navigate = useNavigate();

    const isEventOpen = props.event.status === 'open';

    return (
        <PageContainer size="sm">
            {!isEventOpen ? (
                <Alert variant="warning">
                    <AlertTitle>Event closed</AlertTitle>
                    <AlertDescription>
                        This event has been closed for registration. If you need to participate, please contact your Tournament Organiser or Judge.
                    </AlertDescription>
                </Alert>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
                        <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                            <BadgeCheck className="size-6" />
                        </div>
                        <p className="text-muted-foreground">
                            Log in to submit your decklist for this event.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/login?return=${encodeURIComponent(window.location.pathname)}`)}
                        >
                            Log in to continue
                        </Button>
                    </CardContent>
                </Card>
            )}
        </PageContainer>
    );
}
