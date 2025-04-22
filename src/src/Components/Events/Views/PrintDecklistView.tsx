import { useParams } from "react-router";
import { useEventDetailsQuery } from "../../../Hooks/useEventDetailsQuery";
import { useSearchParams } from "react-router-dom";
import React, { useEffect } from "react";
import { useDecklistQuery } from "../../../Hooks/useDecklistQuery";

export const PrintDecklistView: React.FC = () => {
    const { event_id } = useParams();
    const [ searchParams ] = useSearchParams();
    const userId = searchParams.get('id');

    const { data: eventDetailsData, error: eventError, isLoading: eventLoading } = useEventDetailsQuery(event_id!);
    
    const { data, error, isLoading } = useDecklistQuery(event_id!, userId);

    // Apply proper class to body for print styling
    useEffect(() => {
        // Add print-specific class to body
        document.body.classList.add('print-page-active');
        
        return () => {
            // Remove class when component unmounts
            document.body.classList.remove('print-page-active');
        };
    }, []);

    // Auto-trigger print dialog when the component loads
    useEffect(() => {
        if (!isLoading && !eventLoading && !error && !eventError) {
            // Small delay to ensure rendering is complete
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            
            return () => clearTimeout(timer);
        }
    }, [isLoading, eventLoading, error, eventError]);

    if (eventLoading || isLoading) {
        return <div className="loading-screen">Loading...</div>;
    }

    if (eventError || error) {
        return (
            <div className="error-screen">
                <p>Error. Try again later.</p>
            </div>
        );
    }
    
    return (
        <div>
            <p>
                <div>Player: {data?.player_name}</div>
                <div>Deck: {data?.deck_name}</div>
                <div>Event: {eventDetailsData?.event_name} ({eventDetailsData?.event_date.toLocaleLowerCase()})</div>
            </p>
            <div className="print-decklist-container">
                {data?.groups.map((group, index) => (
                    <div key={index} className="print-decklist-group" style={{ marginBottom: '10px' }}>
                        <h5>{group.group_name}</h5>
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