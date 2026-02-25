import React, { useRef, useState, useCallback } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { useSearchCardsQuery } from '../../Hooks/useSearchCardsQuery';
import { getCaretCoordinates } from '../../Util/getCaretCoordinates';

const SECTION_HEADERS = new Set([
  'sideboard', 'commander', 'companion', 'mainboard', 'main deck', 'deck', 'maindeck',
]);

function extractCardName(line: string): { prefix: string; cardName: string } {
  const match = line.match(/^(SB:\s*)?(\d+x?\s+)?(.*)$/i);
  if (!match) return { prefix: '', cardName: line };
  return {
    prefix: (match[1] ?? '') + (match[2] ?? ''),
    cardName: match[3] ?? '',
  };
}

type DecklistTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'ref'> & {
  registration: UseFormRegisterReturn;
};

export const DecklistTextarea: React.FC<DecklistTextareaProps> = ({ registration, ...textareaProps }) => {
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: suggestions } = useSearchCardsQuery(searchTerm, { debounceMs: 250, minLength: 1 });
  const items = (suggestions && searchTerm.length >= 1) ? suggestions.slice(0, 8) : [];

  const updateSearch = useCallback(() => {
    const ta = localRef.current;
    if (!ta || ta.disabled) return;
    const pos = ta.selectionStart;
    if (pos === null) return;

    const val = ta.value;
    const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
    const lineEndIdx = val.indexOf('\n', pos);
    const line = val.substring(lineStart, lineEndIdx === -1 ? val.length : lineEndIdx);
    const { prefix } = extractCardName(line);
    const cursorInLine = pos - lineStart;
    const cardNameUpToCursor = line.substring(prefix.length, cursorInLine).trimStart();

    const isLastLine = lineEndIdx === -1;
    if (!isLastLine || SECTION_HEADERS.has(cardNameUpToCursor.toLowerCase()) || !/[a-z]/i.test(cardNameUpToCursor)) {
      setSearchTerm('');
      setShowDropdown(false);
      return;
    }

    setSearchTerm(cardNameUpToCursor);
    setSelectedIndex(0);

    const coords = getCaretCoordinates(ta, pos);
    const lh = parseFloat(getComputedStyle(ta).lineHeight) || 20;
    const maxLeft = ta.clientWidth - 220;
    setDropdownPos({ top: coords.top + lh, left: Math.max(0, Math.min(coords.left, maxLeft)) });
    setShowDropdown(true);
  }, []);

  const handleSelect = useCallback((cardName: string) => {
    const ta = localRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    if (pos === null) return;

    const val = ta.value;
    const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
    const lineEnd = val.indexOf('\n', pos);
    const line = val.substring(lineStart, lineEnd === -1 ? val.length : lineEnd);
    const { prefix } = extractCardName(line);

    const newLine = prefix + cardName;
    const afterWithSep = lineEnd === -1 ? '\n' : val.substring(lineEnd);
    const newValue = val.substring(0, lineStart) + newLine + afterWithSep;

    const nativeSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
    nativeSetter.call(ta, newValue);
    ta.dispatchEvent(new Event('input', { bubbles: true }));

    const newPos = lineStart + newLine.length + 1;
    requestAnimationFrame(() => {
      ta.setSelectionRange(newPos, newPos);
      ta.focus();
    });

    setSearchTerm('');
    setShowDropdown(false);
    setSelectedIndex(0);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown || items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Tab':
      case 'Enter':
        e.preventDefault();
        handleSelect(items[selectedIndex].card_name);
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setSearchTerm('');
        break;
    }
  };

  const { ref: rhfRef, onChange: rhfOnChange, ...restReg } = registration;

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        {...restReg}
        {...textareaProps}
        ref={(e) => { rhfRef(e); localRef.current = e; }}
        onChange={(e) => { rhfOnChange(e); updateSearch(); }}
        onKeyDown={handleKeyDown}
        onSelect={updateSearch}
      />
      {showDropdown && items.length > 0 && (
        <div
          className="decklist-typeahead-dropdown"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          {items.map((item, idx) => (
            <div
              key={item.card_name}
              className={`decklist-typeahead-item ${idx === selectedIndex ? 'active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(item.card_name); }}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              {item.card_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
