import { useParams } from "react-router";
import { useEventDetailsQuery } from "../../../Hooks/useEventDetailsQuery";
import { useSearchParams } from "react-router-dom";
import React, { useEffect } from "react";
import { useDecklistQuery } from "../../../Hooks/useDecklistQuery";

export const PrintDecklistView: React.FC = () => {
    const { event_id } = useParams();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('id');

    const { data: eventDetailsData, isError: isEventError, isLoading: eventLoading } = useEventDetailsQuery(event_id!);

    const { data, isError, isLoading } = useDecklistQuery(event_id!, userId);

    // Apply proper class to body for print styling
    useEffect(() => {
        document.body.classList.add('print-page-active');

        return () => {
            document.body.classList.remove('print-page-active');
        };
    }, []);

    // Auto-trigger print dialog when the component loads
    useEffect(() => {
        if (!isLoading && !eventLoading && !isError && !isEventError) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [isLoading, eventLoading, isError, isEventError]);

    if (eventLoading || isLoading) {
        return <div className="p-6 text-muted-foreground">Loading...</div>;
    }

    if (isEventError || isError) {
        return (
            <div className="p-6 text-muted-foreground">
                <p>Error. Try again later.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl p-6">
            <div className="mb-4 space-y-0.5 text-sm">
                <div>Player: {data?.player_name}</div>
                <div>Deck: {data?.deck_name}</div>
                <div>Event: {eventDetailsData?.event_name} ({eventDetailsData?.event_date.toLocaleLowerCase()})</div>
            </div>
            <div className="print-decklist-columns">
                {data?.groups.map((group, index) => (
                    <div key={index} className="print-decklist-group mb-3">
                        <h5 className="font-semibold">{group.group_name}</h5>
                        {group.cards.map((card, cardIndex) => (
                            <div key={cardIndex}>
                                <span>{card.quantity} {card.card_name}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
