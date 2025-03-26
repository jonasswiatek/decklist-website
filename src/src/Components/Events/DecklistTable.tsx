import React from "react";
import { DecklistCard, DecklistGroup, DecklistResponse } from "../../model/api/apimodel";
import { ReactElement, useState, CSSProperties } from 'react';

// Extracted styles as constants
const STYLES: Record<string, CSSProperties> = {
  warning: {
    backgroundColor: 'rgba(255, 243, 205, 0.4)'
  },
  checked: {
    backgroundColor: 'rgba(220, 220, 220, 0.1)', 
    textDecoration: 'line-through'
  },
  warningRow: {
    backgroundColor: 'rgba(255, 243, 205, 0.05)',
    color: '#d63939',
    fontSize: '0.9em',
    fontStyle: 'italic'
  },
  cardSection: {
    breakInside: 'avoid-column', // Updated to a valid value for breakInside
    marginBottom: '15px',
    maxWidth: '500px'
  },
  sectionHeader: {
    fontWeight: 'bold',
    marginBottom: '8px'
  }
};

// ManaCost component remains unchanged
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

// New component for a card warning
interface CardWarningProps {
  warning: string;
}

const CardWarning: React.FC<CardWarningProps> = ({ warning }) => (
  <div className="decklist-warning" style={{
    ...STYLES.warningRow,
    display: 'flex',
    paddingLeft: '30px',
    marginBottom: '5px'
  }}>
    {warning}
  </div>
);

// New component for a card row
interface CardRowProps {
  card: DecklistCard;
  rowId: string;
  isChecked: boolean;
  allowChecklist: boolean;
  onClick: () => void;
}

const CardRow: React.FC<CardRowProps> = ({ card, isChecked, allowChecklist, onClick }) => {
  const getRowStyle = () => {
    if (isChecked) {
      return { ...card.warnings.length > 0 ? STYLES.warning : {}, ...STYLES.checked };
    }
    return card.warnings.length > 0 ? STYLES.warning : {};
  };
  
  return (
    <div 
      className={`decklist-row ${allowChecklist ? 'checklist-enabled' : ''}`}
      style={{
        display: 'flex', 
        width: '100%',
        cursor: allowChecklist ? 'pointer' : 'default',
        ...getRowStyle()
      }}
      onClick={onClick}
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

// New component for a card section
interface CardSectionProps {
  group: DecklistGroup;
  allowChecklist: boolean;
  checkedRows: Set<string>;
  onCardClick: (rowId: string) => void;
}

const CardSection: React.FC<CardSectionProps> = ({ group, allowChecklist, checkedRows, onCardClick }) => {
  if (!group.cards || group.cards.length === 0) return null;
  
  const cardCount = group.cards.reduce((a, b) => a + b.quantity, 0);
  
  // Generate a unique ID for each row
  const getRowId = (card: DecklistCard, index: number) => {
    return `${group.group_name}-${index}-${card.card_name}`;
  };
  
  return (
    <div className="card-section" style={STYLES.cardSection} key={`section-${group.group_name}`}>
      <div className="section-header" style={STYLES.sectionHeader}>
        {group.group_name} ({cardCount})
      </div>
      
      <div className="section-cards">
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

// Custom hook for managing checked rows
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

// Main component
type DecklistTableProps = {
  decklistData: DecklistResponse,
  allowChecklist: boolean,
}

export const DecklistTable: React.FC<DecklistTableProps> = ({ decklistData, allowChecklist }) => {
  const { checkedRows, toggleRow } = useCheckedRows();
  
  return (
    <div className="decklist-container" style={{ width: '100%' }}>
      {decklistData.groups.map(group => (
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