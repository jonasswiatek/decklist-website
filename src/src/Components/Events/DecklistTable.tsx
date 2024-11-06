import { DecklistCard } from "../../model/api/apimodel";

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
                                <td>{p.quantity}</td>
                                <td>{p.card_name}</td>
                                <td>{p.mana_cost}</td>
                            </tr>
                        </>
                    )
                }

                return (
                    <tr>
                        <td>{p.quantity}</td>
                        <td>{p.card_name}</td>
                        <td>{p.mana_cost}</td>
                    </tr>
                )
            })}

            <tr>
                <td colSpan={3} style={{paddingTop:15}}><b>Sideboard</b></td>
            </tr>

            {props?.sideboard?.map((p) => {
                return (
                    <tr>
                        <td>{p.quantity}</td>
                        <td>{p.card_name}</td>
                        <td>{p.mana_cost}</td>
                    </tr>
                )
            })}
            </tbody>
        </table>
    );
}