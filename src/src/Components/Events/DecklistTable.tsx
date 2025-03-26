import React from "react";
import { DecklistCard } from "../../model/api/apimodel";
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
    mainboard?: DecklistCard[],
    sideboard?: DecklistCard[],
    allowChecklist: boolean
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
    const getRowId = (card: DecklistCard, isSideboard: boolean, index: number) => {
        return `${isSideboard ? 'sb' : 'mb'}-${index}-${card.card_name}`;
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
    
    // Group cards by type for better organization and page break control
    const groupCardsByType = (cards: DecklistCard[] | undefined) => {
        if (!cards || cards.length === 0) return {};
        
        const groups: { [key: string]: DecklistCard[] } = {};
        cards.forEach(card => {
            if (!groups[card.type]) {
                groups[card.type] = [];
            }
            groups[card.type].push(card);
        });
        return groups;
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

    // Render a section of cards with the same type
    const renderCardSection = (type: string, cards: DecklistCard[], isSideboard: boolean = false) => {
        if (!cards || cards.length === 0) return null;
        
        const typeCount = cards.reduce((a, b) => a + b.quantity, 0);
        
        return (
            <div className="card-section" style={{ 
                pageBreakInside: 'avoid',
                marginBottom: '15px'
            }} key={`section-${isSideboard ? 'sb-' : ''}${type}`}>
                <div className="section-header" style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '8px'
                }}>
                    {type} ({typeCount})
                </div>
                
                <div className="section-cards">
                    {cards.map((card, index) => {
                        const rowId = getRowId(card, isSideboard, index);
                        
                        return (
                            <React.Fragment key={`${isSideboard ? 'sb-' : ''}card-${type}-${index}`}>
                                {renderCardRow(card, rowId)}
                                {renderCardWarnings(card)}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        );
    };
    
    // Group cards by type
    const mainboardGroups = groupCardsByType(props.mainboard);
    
    return (
        <div className="decklist-container" style={{ width: '100%' }}>
            {/* Render mainboard cards by type sections */}
            {Object.keys(mainboardGroups).map(type => 
                renderCardSection(type, mainboardGroups[type])
            )}

            {/* Render sideboard as its own section */}
            {props?.sideboard && props.sideboard.length > 0 && (
                <div className="card-section" style={{ pageBreakInside: 'avoid', marginTop: '50px' }}>
                    <div className="section-header" style={{ 
                        fontWeight: 'bold', 
                        marginTop: '15px',
                        marginBottom: '8px'
                    }}>
                        Sideboard ({props.sideboard.reduce((acc, val) => acc + val.quantity, 0)})
                    </div>
                    
                    <div className="section-cards">
                        {props.sideboard.map((card, index) => {
                            const rowId = getRowId(card, true, index);
                            
                            return (
                                <React.Fragment key={`sideboard-${index}`}>
                                    {renderCardRow(card, rowId)}
                                    {renderCardWarnings(card)}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}