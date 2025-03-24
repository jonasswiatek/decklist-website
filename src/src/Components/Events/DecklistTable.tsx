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
    let currentType = '';
    const [checkedRows, setCheckedRows] = useState<Set<string>>(new Set());
    
    const warningStyle = {
        backgroundColor: 'rgba(255, 243, 205, 0.4)' // Much lighter yellow warning color with transparency
    };
    
    const checkedStyle = {
        backgroundColor: 'rgba(220, 220, 220, 0.1)', // Very subtle gray that's close to typical page backgrounds
        textDecoration: 'line-through'
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
            return { ...card.has_warning ? warningStyle : {}, ...checkedStyle };
        }
        return card.has_warning ? warningStyle : {};
    };
    
    return (
        <table>
            <tbody>
                {props?.mainboard?.map((p, index) => {
                const rowId = getRowId(p, false, index);
                
                if (currentType != p.type) {
                    currentType = p.type;
                    const typeCount = props?.mainboard?.filter(x => x.type == p.type).reduce((a, b) => a + b.quantity, 0);

                    return (
                        <>
                            <tr>
                                <td colSpan={3} style={{paddingTop:15}}><b>{p.type} ({typeCount})</b></td>
                            </tr>
                            <tr 
                                style={getRowStyle(rowId, p)}
                                onClick={() => handleCardClick(rowId)}
                                className={props.allowChecklist ? 'checklist-enabled' : ''}
                            >
                                <td className='decklist-tbl-quantity'>{p.quantity}</td>
                                <td className='decklist-tbl-card-name'>{p.card_name}</td>
                                <td className='decklist-tbl-mana-cost' style={{textAlign: 'right'}}><ManaCost cost={p.mana_cost} /></td>
                            </tr>
                        </>
                    )
                }

                return (
                    <tr 
                        style={getRowStyle(rowId, p)}
                        onClick={() => handleCardClick(rowId)}
                        className={props.allowChecklist ? 'checklist-enabled' : ''}
                    >
                        <td className='decklist-tbl-quantity'>{p.quantity}</td>
                        <td className='decklist-tbl-card-name'>{p.card_name}</td>
                        <td className='decklist-tbl-mana-cost' style={{textAlign: 'right'}}><ManaCost cost={p.mana_cost} /></td>
                    </tr>
                )
            })}

            <tr>
                <td colSpan={3} style={{paddingTop:15}}><b>Sideboard</b></td>
            </tr>

            {props?.sideboard?.map((p, index) => {
                const rowId = getRowId(p, true, index);
                
                return (
                    <tr 
                        style={getRowStyle(rowId, p)}
                        onClick={() => handleCardClick(rowId)}
                        className={props.allowChecklist ? 'checklist-enabled' : ''}
                    >
                        <td className='decklist-tbl-quantity'>{p.quantity}</td>
                        <td className='decklist-tbl-card-name'>{p.card_name}</td>
                        <td className='decklist-tbl-mana-cost' style={{textAlign: 'right'}}><ManaCost cost={p.mana_cost} /></td>
                    </tr>
                )
            })}
            </tbody>
        </table>
    );
}