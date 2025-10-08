
import type { Card as CardType } from '../types';
import { DiscardPile } from './DiscardPile';

export const Deck = ({ deck, discardPile, drawFromDeck, discardCard, takeDiscardPile }: { deck: { cards: CardType[] }, discardPile: CardType[], drawFromDeck: () => void, discardCard: (card: CardType) => void, takeDiscardPile: () => void }) => {
  return (
    <div>
      <button onClick={drawFromDeck}>Draw from Deck</button>
      <div style={{ width: '72px', height: '96px', border: '1px solid black' }}>
        Deck ({deck.cards.length})
      </div>

      <button onClick={takeDiscardPile}>Take Discard Pile</button>
      <DiscardPile discardPile={discardPile} onDrop={discardCard} />
    </div>
  );
};
