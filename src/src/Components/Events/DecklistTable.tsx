import React from "react";
import { DecklistCard, DecklistGroup } from "../../model/api/apimodel";
import { ReactElement, useState } from 'react';
import { cn } from "@/lib/utils";

interface ManaCostProps {
    cost: string;
}

export function ManaCost({ cost }: ManaCostProps): ReactElement {
    // Parse the cost string to extract individual mana symbols
    // For example, "{2}{U}" should give ["2", "U"]
    if (!cost)
        return <></>;

    const symbols = cost.match(/\{([^}]+)\}/g)?.map(match => match.substring(1, match.length - 1).replace('/', '')) || [];

    return (
        <>
            {symbols.map((symbol, index) => (
                <i key={index} className={`ms ms-cost ms-${symbol.toLowerCase()} text-[0.85em]`} />
            ))}
        </>
    );
}

interface CardWarningProps {
    warning: string;
}

const CardWarning: React.FC<CardWarningProps> = ({ warning }) => (
    <div className="pl-8 pb-1 text-sm font-semibold italic text-destructive">
        {warning}
    </div>
);

interface CardRowProps {
    card: DecklistCard;
    rowId: string;
    isChecked: boolean;
    allowChecklist: boolean;
    onClick: () => void;
}

const CardRow: React.FC<CardRowProps> = ({ card, isChecked, allowChecklist, onClick }) => {
    const hasWarning = card.warnings.length > 0;

    return (
        <div
            className={cn(
                "flex w-full items-baseline gap-2 rounded px-1 py-0.5 transition-colors",
                allowChecklist && "cursor-pointer hover:bg-muted/50",
                hasWarning && "bg-warning/10",
                isChecked && "line-through opacity-50"
            )}
            onClick={onClick}
        >
            <div className="w-6 shrink-0 text-left tabular-nums text-muted-foreground">
                {card.quantity}
            </div>
            <div className="flex-1">
                {card.card_name}
            </div>
            <div className="min-w-10 shrink-0 text-right">
                <ManaCost cost={card.mana_cost} />
            </div>
        </div>
    );
};

interface CardSectionProps {
    group: DecklistGroup;
    allowChecklist: boolean;
    checkedRows: Set<string>;
    onCardClick: (rowId: string) => void;
}

const CardSection: React.FC<CardSectionProps> = ({ group, allowChecklist, checkedRows, onCardClick }) => {
    if (!group.cards || group.cards.length === 0) return null;

    const cardCount = group.cards.reduce((a, b) => a + b.quantity, 0);

    const getRowId = (card: DecklistCard, index: number) => {
        return `${group.group_name}-${index}-${card.card_name}`;
    };

    return (
        <div className="decklist-column-item mb-5 max-w-lg" key={`section-${group.group_name}`}>
            <div className="mb-2 flex items-center gap-2 border-b border-border/60 pb-1 text-sm font-semibold">
                <span>{group.group_name}</span>
                <span className="text-muted-foreground">({cardCount})</span>
            </div>

            <div>
                {group.cards.map((card, index) => {
                    const rowId = getRowId(card, index);
                    const isChecked = checkedRows.has(rowId);

                    return (
                        <React.Fragment key={`card-${group.group_name}-${index}`}>
                            <CardRow
                                card={card}
                                rowId={rowId}
                                isChecked={isChecked}
                                allowChecklist={allowChecklist}
                                onClick={() => onCardClick(rowId)}
                            />
                            {card.warnings.map((warning, idx) => (
                                <CardWarning key={`warning-${idx}`} warning={warning} />
                            ))}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

function useCheckedRows() {
    const [checkedRows, setCheckedRows] = useState<Set<string>>(new Set());

    const toggleRow = (rowId: string, allowChecklist: boolean) => {
        if (!allowChecklist) return;

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

    return { checkedRows, toggleRow };
}

type DecklistTableProps = {
    cardGroups: DecklistGroup[],
    allowChecklist: boolean,
}

export const DecklistTable: React.FC<DecklistTableProps> = ({ cardGroups, allowChecklist }) => {
    const { checkedRows, toggleRow } = useCheckedRows();

    return (
        <div className="decklist-columns w-full">
            {cardGroups.map(group => (
                <CardSection
                    key={`section-${group.group_name}`}
                    group={group}
                    allowChecklist={allowChecklist}
                    checkedRows={checkedRows}
                    onCardClick={(rowId) => toggleRow(rowId, allowChecklist)}
                />
            ))}
        </div>
    );
};
