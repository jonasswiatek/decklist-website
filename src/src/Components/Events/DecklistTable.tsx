import React from "react";
import { DecklistCard, DecklistGroup, DecklistResponse } from "../../model/api/apimodel";
import { ReactElement, useState } from 'react';

interface ManaCostProps {
    cost: string;
}
  
export function ManaCost({ cost }: ManaCostProps): ReactElement {
    // Parse the cost string to extract individual mana symbols
    // For example, "{2}{U}" should give ["2", "U"]
    if (!cost)
        return <></>;

    const symbols = cost.match(/\{([^}]+)\}/g)?.map(match => match.substring(1, match.length - 1).replace('/','')) || [];

    return (
        <>
        {symbols.map((symbol, index) => (
            <i key={index} style={{ fontSize: '0.85em' }} className={`ms ms-cost ms-${symbol.toLowerCase()}`} />
        ))}
        </>
    );
}

type DecklistTableProps = {
    decklistData: DecklistResponse,
    allowChecklist: boolean,
}

export const DecklistTable: React.FC<DecklistTableProps> = (props) => {
    const [checkedRows, setCheckedRows] = useState<Set<string>>(new Set());
    
    const warningStyle = {
        backgroundColor: 'rgba(255, 243, 205, 0.4)' // Much lighter yellow warning color with transparency
    };
    
    const checkedStyle = {
        backgroundColor: 'rgba(220, 220, 220, 0.1)', // Very subtle gray that's close to typical page backgrounds
        textDecoration: 'line-through'
    };
    
    const warningRowStyle = {
        backgroundColor: 'rgba(255, 243, 205, 0.05)', // Even lighter yellow for warning messages
        color: '#d63939', // Brighter red warning text color for better visibility
        fontSize: '0.9em',
        fontStyle: 'italic'
    };
    
    // Create a unique ID for each row based on card and position
    const getRowId = (card: DecklistCard, index: number, groupName: string) => {
        return `${groupName}-${index}-${card.card_name}`;
    };
    
    const handleCardClick = (rowId: string) => {
        if (!props.allowChecklist) return;
        
        setCheckedRows(prevCheckedRows => {
            const newCheckedRows = new Set(prevCheckedRows);
            if (newCheckedRows.has(rowId)) {
                newCheckedRows.delete(rowId);
            } else {
                newCheckedRows.add(rowId);
            }
            return newCheckedRows;
        });
    };
    
    const getRowStyle = (rowId: string, card: DecklistCard) => {
        if (checkedRows.has(rowId)) {
            return { ...card.warnings.length > 0 ? warningStyle : {}, ...checkedStyle };
        }
        return card.warnings.length > 0 ? warningStyle : {};
    };
    
    // Render a card row
    const renderCardRow = (card: DecklistCard, rowId: string) => {
        return (
            <div 
                className={`decklist-row ${props.allowChecklist ? 'checklist-enabled' : ''}`}
                style={{
                    display: 'flex', 
                    width: '100%',
                    cursor: props.allowChecklist ? 'pointer' : 'default',
                    ...getRowStyle(rowId, card)
                }}
                onClick={() => handleCardClick(rowId)}
            >
                <div className='decklist-quantity' style={{ width: '20px', flexShrink: 0, textAlign: 'left' }}>
                    {card.quantity}
                </div>
                <div className='decklist-card-name' style={{ flex: 1 }}>
                    {card.card_name}
                </div>
                <div className='decklist-mana-cost' style={{ minWidth: '40px', textAlign: 'right', flexShrink: 0 }}>
                    <ManaCost cost={card.mana_cost} />
                </div>
            </div>
        );
    };

    // Render warning for a card
    const renderCardWarnings = (card: DecklistCard) => {
        if (!card.warnings || card.warnings.length === 0) return null;
        
        return card.warnings.map((warning, idx) => (
            <div key={`warning-${idx}`} className="decklist-warning" style={{
                ...warningRowStyle,
                display: 'flex',
                paddingLeft: '30px',
                marginBottom: '5px'
            }}>
                {warning}
            </div>
        ));
    };

    // Render a section of cards
    const renderCardSection = (group: DecklistGroup) => {
        if (!group.cards || group.cards.length === 0) return null;
        
        const cardCount = group.cards.reduce((a, b) => a + b.quantity, 0);
        
        return (
            <div className="card-section" style={{ 
                pageBreakInside: 'avoid',
                marginBottom: '15px',
                maxWidth: '500px'
            }} key={`section-${group.group_name}`}>
                <div className="section-header" style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '8px'
                }}>
                    {group.group_name} ({cardCount})
                </div>
                
                <div className="section-cards">
                    {group.cards.map((card, index) => {
                        const rowId = getRowId(card, index, group.group_name);
                        
                        return (
                            <React.Fragment key={`card-${group.group_name}-${index}`}>
                                {renderCardRow(card, rowId)}
                                {renderCardWarnings(card)}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        );
    };
    
    return (
        <div className="decklist-container" style={{ width: '100%' }}>
            {/* Render all card groups */}
            {props.decklistData.groups.map(group => 
                renderCardSection(group)
            )}
        </div>
    );
}