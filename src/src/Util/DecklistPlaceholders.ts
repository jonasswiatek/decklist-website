export const getDecklistPlaceholder = (decklistStyle: string = 'sixty'): string => {
  if (decklistStyle === 'commander') {
    return `Atraxa, Grand Unifier

Birds of Paradise
Bloom Tender
Eternal Witness
Cultivate
Demonic Tutor
Counterspell
Command Tower
Breeding Pool
Temple Garden`;
  } else {
    return `4 Lightning Bolt
3 Monastery Swiftspear
4 Young Pyromancer
2 Fatal Push
4 Consider

Sideboard
2 Flusterstorm
3 Rest in Peace`;
  }
};
