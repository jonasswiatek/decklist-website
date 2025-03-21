import { DecklistCard } from "../../model/api/apimodel";
import { ReactElement } from 'react';

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
}

export const DecklistTable: React.FC<DecklistTableProps> = (props) => {
    let currentType = '';
    return (
        <table>
            <tbody>
                {props?.mainboard?.map((p) => {
                if (currentType != p.type) {
                    currentType = p.type;
                    const typeCount = props?.mainboard?.filter(x => x.type == p.type).reduce((a, b) => a + b.quantity, 0);

                    return (
                        <>
                            <tr>
                                <td colSpan={3} style={{paddingTop:15}}><b>{p.type} ({typeCount})</b></td>
                            </tr>
                            <tr>
                                <td className='decklist-tbl-quantity'>{p.quantity}</td>
                                <td className='decklist-tbl-card-name'>{p.card_name}</td>
                                <td className='decklist-tbl-mana-cost' style={{textAlign: 'right'}}><ManaCost cost={p.mana_cost} /></td>
                            </tr>
                        </>
                    )
                }

                return (
                    <tr>
                        <td className='decklist-tbl-quantity'>{p.quantity}</td>
                        <td className='decklist-tbl-card-name'>{p.card_name}</td>
                        <td className='decklist-tbl-mana-cost' style={{textAlign: 'right'}}><ManaCost cost={p.mana_cost} /></td>
                    </tr>
                )
            })}

            <tr>
                <td colSpan={3} style={{paddingTop:15}}><b>Sideboard</b></td>
            </tr>

            {props?.sideboard?.map((p) => {
                return (
                    <tr>
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