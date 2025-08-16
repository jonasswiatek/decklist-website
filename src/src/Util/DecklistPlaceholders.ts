export const getDecklistPlaceholder = (decklistStyle: string = 'sixty'): string => {
  if (decklistStyle === 'commander') {
    return `Commander
Atraxa, Grand Unifier

Companion
Jegantha, the Wellspring

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
4 Fable of the Mirror-Breaker // Reflection of Kiki-Jiki
2 Wear // Tear

Sideboard
2 Flusterstorm
3 Rest in Peace`;
  }
};
